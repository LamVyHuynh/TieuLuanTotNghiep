// Import thư viện Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import Database Pool (Đảm bảo đường dẫn này khớp với file db của mày nha)
const pool = require("../config/db");

const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

async function getChatbotResponse(userMessage) {
  try {
    console.log("Đang lấy danh sách sản phẩm từ Database...");

    // 1. LẤY SẢN PHẨM TỪ DB ĐỂ "DẠY" AI (Lấy ID và Tên để đưa vào Prompt)
    const [dbProducts] = await pool.query(
      "SELECT id_product, name, price, discount_price, image_url FROM product",
    );
    const productListString = dbProducts
      .map((p) => `[ID: ${p.id_product}] - Tên món: ${p.name}`)
      .join("\n");

    console.log("Đang quét danh sách các model Google cho phép...");
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

      if (availableModels.includes("gemini-3.5-flash"))
        modelName = "gemini-3.5-flash";
      else if (availableModels.includes("gemini-flash-latest"))
        modelName = "gemini-flash-latest";
      else if (availableModels.includes("gemini-2.0-flash"))
        modelName = "gemini-2.0-flash";
      else {
        const safeModels = availableModels.filter((m) => !m.includes("2.5"));
        modelName = safeModels.length > 0 ? safeModels[0] : availableModels[0];
      }
    }

    console.log(`🚀 Chốt sử dụng model an toàn: ${modelName}`);

    // 2. KHỞI TẠO AI VÀ ÉP XUẤT JSON
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }, // Ép AI trả về JSON chuẩn
    });

    // 3. LỜI THOẠI HUẤN LUYỆN KẾT HỢP BÁN HÀNG
    const systemInstruction = `
      Bạn là "HealthyBot", một trợ lý ảo tư vấn dinh dưỡng thân thiện, tự nhiên như một người bạn của cửa hàng "HealthyGO".
      
      DANH SÁCH SẢN PHẨM CỬA HÀNG ĐANG BÁN:
      ${productListString}

      Quy tắc tư vấn:
      1. Trả lời ngắn gọn, tự nhiên, đi thẳng vào vấn đề (dùng emoji 🌱, 🥗...).
      2. Dựa vào nhu cầu của khách, hãy tư vấn các món ăn phù hợp.
      3. QUAN TRỌNG: Nếu món bạn khuyên khách ăn CÓ TRONG DANH SÁCH SẢN PHẨM ở trên, hãy đưa ID của món đó vào mảng "suggested_ids".
      4. LINH HOẠT: Nếu cửa hàng KHÔNG CÓ món phù hợp, bạn VẪN PHẢI TƯ VẤN các món bên ngoài bình thường để giúp đỡ khách hàng (lúc này mảng "suggested_ids" để trống []). Không bao giờ nói "cửa hàng không có thì tôi không tư vấn".
      
      BẮT BUỘC trả về ĐÚNG cấu trúc JSON sau:
      {
        "reply": "Câu trả lời tư vấn của bạn...",
        "suggested_ids": [1, 2] 
      }
    `;

    const prompt = `${systemInstruction}\n\nKhách hàng hỏi: "${userMessage}"\nHealthyBot trả lời:`;

    // 4. GỬI YÊU CẦU VÀ XỬ LÝ KẾT QUẢ JSON
    const result = await model.generateContent(prompt);
    let responseText = await result.response.text();

    // Dọn dẹp phòng trường hợp AI bọc JSON trong Markdown (```json)
    responseText = responseText.replace(/```json|```/g, "").trim();

    const aiData = JSON.parse(responseText);

    // Dò tìm thông tin chi tiết của các sản phẩm được AI gợi ý
    let suggestedProducts = [];
    if (aiData.suggested_ids && aiData.suggested_ids.length > 0) {
      suggestedProducts = dbProducts.filter((p) =>
        aiData.suggested_ids.includes(p.id_product),
      );
    }

    // Trả về cho Controller cả câu thoại lẫn thông tin sản phẩm
    return {
      reply: aiData.reply,
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
