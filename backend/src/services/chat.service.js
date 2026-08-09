// Import thư viện Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import Database Pool
const pool = require("../config/db");

//  IMPORT HÀM MÃ HÓA ID (Đảm bảo đường dẫn require đúng với cấu trúc dự án của bạn)
const { encodeId } = require("../utils/hashid.util");
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

async function getChatbotResponse(userMessage) {
  try {
    console.log("Đang lấy danh sách sản phẩm từ Database...");

    // 1. LẤY SẢN PHẨM TỪ DB ĐỂ "DẠY" AI
    const [dbProducts] = await pool.query(
      "SELECT id_product, name, price, discount_price, image_url FROM product",
    );
    const productListString = dbProducts.map(
      (p) => `[ID: ${p.id_product}] - Tên món: ${p.name}`,
    ).js
      ? ""
      : dbProducts
          .map((p) => `[ID: ${p.id_product}] - Tên món: ${p.name}`)
          .join("\n");

    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const listData = await listResponse.json();

    let modelName = "gemini-flash-latest";
    if (listData.models) {
      const availableModels = listData.models
        .filter(
          (m) =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes("generateContent"),
        )
        .map((m) => m.name.replace("models/", ""));

      if (availableModels.includes("gemini-flash-latest")) {
        modelName = "gemini-flash-latest"; // Ưu tiên số 1: Xài bản cân bằng nhất
      } else if (availableModels.includes("gemini-2.0-flash")) {
        modelName = "gemini-2.0-flash"; // Ưu tiên số 2
      } else if (availableModels.includes("gemini-3.5-flash")) {
        modelName = "gemini-3.5-flash"; // Ưu tiên số 3: Tạm thời cho xuống dưới vì đang kẹt mạng
      } else {
        const safeModels = availableModels.filter((m) => !m.includes("2.5"));
        modelName = safeModels.length > 0 ? safeModels[0] : availableModels[0];
      }
    }

    console.log(`🚀 Chốt sử dụng model an toàn: ${modelName}`);

    // 2. KHỞI TẠO AI (Không ép responseMimeType để tránh lỗi cú pháp JSON)
    const model = genAI.getGenerativeModel({ model: modelName });

    // 3. LỜI THOẠI HƯỚNG DẪN AI GỢI Ý KÈM ID
    const systemInstruction = `
      Bạn là "HealthyBot", trợ lý ảo tư vấn dinh dưỡng của cửa hàng "HealthyGO".
      DANH SÁCH SẢN PHẨM CỦA CỬA HÀNG:
      ${productListString}

      Quy tắc trả lời:
      - Tư vấn ngắn gọn, thân thiện, dùng emoji (🌱, 🥗...).
      - Nếu sản phẩm bạn gợi ý có trong danh sách trên, ở cuối câu trả lời hãy ghi kèm mã ID theo định dạng: [SUGGESTED_IDS: 1, 2] (Ví dụ: [SUGGESTED_IDS: 5]). Nếu không có sản phẩm nào trong cửa hàng, không cần ghi dòng này hoặc ghi [SUGGESTED_IDS: ].
    `;

    const prompt = `${systemInstruction}\n\nKhách hàng hỏi: "${userMessage}"\nHealthyBot trả lời:`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    // 4. BÓC TÁCH ID THÔNG MINH TỪ VĂN BẢN
    let suggestedIds = [];
    let cleanReply = responseText;

    const match = responseText.match(/\[SUGGESTED_IDS:\s*([\d,\s]*)\]/);
    if (match) {
      // Lấy danh sách ID nếu tìm thấy
      const idsString = match[1].trim();
      if (idsString) {
        suggestedIds = idsString
          .split(",")
          .map((id) => Number(id.trim()))
          .filter((id) => !isNaN(id));
      }
      // Xóa thẻ [SUGGESTED_IDS: ...] đi để khách hàng không nhìn thấy mã kỹ thuật này
      cleanReply = responseText.replace(/\[SUGGESTED_IDS:.*?\]/, "").trim();
    }

    // Dò tìm thông tin chi tiết sản phẩm từ Database dựa trên ID bóc tách được
    let suggestedProducts = [];
    if (suggestedIds.length > 0) {
      suggestedProducts = dbProducts
        .filter((p) => suggestedIds.includes(p.id_product))
        .map((p) => ({
          ...p,
          id_product: encodeId(p.id_product), // Mã hóa ID thật thành ID chuỗi bảo mật trước khi gửi ra ngoài
        }));
    }

    return {
      reply: cleanReply,
      products: suggestedProducts,
    };
  } catch (error) {
    console.error("Lỗi khi kết nối Google Gemini AI:", error);
    throw new Error(
      "Xin lỗi, HealthyBot đang đi thu hoạch rau. Bạn vui lòng thử lại sau vài phút nhé! 🌱",
    );
  }
}

module.exports = { getChatbotResponse };
