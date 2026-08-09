// Import thư viện Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lấy API Key từ biến môi trường và cắt bỏ khoảng trắng
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

async function getChatbotResponse(userMessage) {
  try {
    console.log(
      "Đang quét danh sách các model Google cho phép với API Key này...",
    );

    // 1. Gọi trực tiếp API để hỏi Google
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const listData = await listResponse.json();

    let modelName = "gemini-flash-latest"; // Đặt mặc định an toàn

    if (listData.models) {
      // Lọc ra các model hỗ trợ tính năng chat
      const availableModels = listData.models
        .filter(
          (m) =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes("generateContent"),
        )
        .map((m) => m.name.replace("models/", ""));

      // CẬP NHẬT LOGIC CHỌN MÔ HÌNH (Dựa trên danh sách năm 2026)
      if (availableModels.includes("gemini-3.5-flash")) {
        modelName = "gemini-3.5-flash"; // Ưu tiên số 1
      } else if (availableModels.includes("gemini-flash-latest")) {
        modelName = "gemini-flash-latest"; // Ưu tiên số 2
      } else if (availableModels.includes("gemini-2.0-flash")) {
        modelName = "gemini-2.0-flash"; // Ưu tiên số 3
      } else if (availableModels.length > 0) {
        // Lọc bỏ bẫy "2.5" không hỗ trợ người dùng mới
        const safeModels = availableModels.filter((m) => !m.includes("2.5"));
        modelName = safeModels.length > 0 ? safeModels[0] : availableModels[0];
      }
    } else {
      console.log(
        "❌ Không lấy được danh sách model, Google trả về:",
        listData,
      );
    }

    console.log(` Chốt sử dụng model an toàn: ${modelName}`);

    // 2. Khởi tạo AI với model đã được chốt
    const model = genAI.getGenerativeModel({ model: modelName });

    // LỜI THOẠI HUẤN LUYỆN NGẦM (System Prompt)
    const systemInstruction = `
      Bạn là một trợ lý ảo thân thiện, nhiệt tình và chuyên nghiệp của cửa hàng thực phẩm sạch "HealthyGO".
      Sứ mệnh của bạn là tư vấn cho khách hàng về các loại rau củ quả hữu cơ, thực phẩm tốt cho sức khỏe.
      Quy tắc trả lời:
      1. Luôn xưng hô là "HealthyBot" và gọi khách hàng là "bạn" hoặc "quý khách".
      2. Trả lời ngắn gọn, súc tích, đi thẳng vào vấn đề (dưới 3-4 câu).
      3. Luôn giữ thái độ vui vẻ, sử dụng emoji phù hợp (🌱, 🥗, 💚...).
      4. Nếu khách hỏi những thứ không liên quan đến ăn uống, sức khỏe hay cửa hàng, hãy lịch sự từ chối và lái câu chuyện về thực phẩm sạch.
    `;

    const prompt = `${systemInstruction}\n\nKhách hàng hỏi: "${userMessage}"\nHealthyBot trả lời:`;

    // Gửi yêu cầu và đợi kết quả
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error("Lỗi khi kết nối Google Gemini AI:", error);
    throw new Error(
      "Xin lỗi, HealthyBot đang đi thu hoạch rau. Bạn vui lòng thử lại sau vài phút nhé! 🌱",
    );
  }
}

module.exports = {
  getChatbotResponse,
};
