// 1. Import thêm SchemaType từ thư viện Google
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

// =====================================================================
// THÊM LỆNH NÀY ĐỂ SỬA LỖI "FETCH FAILED" (ÉP NODE.JS DÙNG IPV4)
// =====================================================================
const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");

// Import Database Pool
const pool = require("../config/db");

// IMPORT HÀM MÃ HÓA ID
const { encodeId } = require("../utils/hashid.util");
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

// 🚀 TẠO KHUÔN MẪU ÉP BUỘC AI PHẢI TRẢ VỀ ĐÚNG CẤU TRÚC NÀY
const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    reply: {
      type: SchemaType.STRING,
      description:
        "Câu trả lời bằng tiếng Việt, cực kỳ ngắn gọn (1-3 câu), thân thiện, có emoji.",
    },
    suggestedIds: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.NUMBER },
      description:
        "Mảng chứa các ID sản phẩm gợi ý. Mảng rỗng [] nếu không có.",
    },
  },
  required: ["reply", "suggestedIds"],
};

async function getChatbotResponse(userMessage) {
  try {
    console.log("Đang lấy danh sách sản phẩm từ Database...");

    // 1. LẤY SẢN PHẨM TỪ DB ĐỂ "DẠY" AI
    const [dbProducts] = await pool.query(
      "SELECT id_product, name, price, discount_price, image_url FROM product",
    );
    const productListString =
      dbProducts.length === 0
        ? ""
        : dbProducts
            .map((p) => `[ID: ${p.id_product}] - Tên món: ${p.name}`)
            .join("\n");

    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const listData = await listResponse.json();

    let modelName = "gemini-1.5-flash";

    if (listData.models) {
      const availableModels = listData.models
        .filter(
          (m) =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes("generateContent"),
        )
        .map((m) => m.name.replace("models/", ""));

      if (availableModels.includes("gemini-1.5-flash")) {
        modelName = "gemini-1.5-flash";
      } else if (availableModels.includes("gemini-2.0-flash")) {
        modelName = "gemini-2.0-flash";
      } else {
        const safeModels = availableModels.filter((m) => !m.includes("2.5"));
        modelName = safeModels.length > 0 ? safeModels[0] : availableModels[0];
      }
    }

    console.log(`✅ Chốt sử dụng model an toàn: ${modelName}`);

    // 2. KHỞI TẠO AI VÀ ÉP BUỘC TRẢ VỀ JSON KÈM SCHEMA
    const systemInstructionText = `
Bạn là "HealthyBot", nhân viên tư vấn dinh dưỡng của HealthyGO.
DANH SÁCH MÓN ĂN CỦA CỬA HÀNG:
${productListString}

BẠN LÀ MỘT API HỆ THỐNG. CHỈ ĐƯỢC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON. KHÔNG ĐƯỢC IN RA BẤT KỲ DÒNG SUY NGHĨ HAY VĂN BẢN NÀO KHÁC BÊN NGOÀI JSON.
`;

    // Khởi tạo model với cấu hình JSON Mode và Schema
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstructionText,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema, // 🚀 Bật khuôn mẫu cấu trúc
      },
    });

    const prompt = `Khách hàng hỏi: "${userMessage}"`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    // 4. BÓC TÁCH VÀ DỌN RÁC THÔNG MINH
    let cleanReply = "";
    let suggestedIds = [];

    try {
      // 🚀 BỘ LỌC: Tìm từ dấu { đầu tiên đến dấu } cuối cùng, bỏ qua mọi chữ tiếng Anh dư thừa
      let jsonString = responseText;
      const firstBrace = responseText.indexOf("{");
      const lastBrace = responseText.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
        jsonString = responseText.slice(firstBrace, lastBrace + 1);
      }

      // Lúc này jsonString chắc chắn chỉ chứa đúng dữ liệu JSON sạch
      const data = JSON.parse(jsonString);
      cleanReply = data.reply || "Xin lỗi, mình chưa hiểu ý bạn lắm. 🌱";
      suggestedIds = data.suggestedIds || [];
    } catch (e) {
      console.error("Lỗi parse JSON từ AI:", e);
      cleanReply = "Xin lỗi, HealthyBot đang gặp chút sự cố xử lý câu chữ. 🌱";
    }

    // Dò tìm thông tin chi tiết sản phẩm từ Database dựa trên ID
    let suggestedProducts = [];
    if (suggestedIds.length > 0) {
      suggestedProducts = dbProducts
        .filter((p) => suggestedIds.includes(p.id_product))
        .map((p) => ({
          ...p,
          id_product: encodeId(p.id_product),
        }));
    }

    return {
      reply: cleanReply,
      products: suggestedProducts,
    };
  } catch (error) {
    console.error("❌ Lỗi khi kết nối Google Gemini AI:", error);
    throw new Error(
      "Xin lỗi, kết nối mạng đang không ổn định. Bạn vui lòng thử lại sau vài phút nhé! 🌱",
    );
  }
}

module.exports = { getChatbotResponse };
