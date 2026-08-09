// Import thư viện Google Generative AI
const { GoogleGenerativeAI } = require("@google-generative-ai");

// Khởi tạo client Google Generative AI với API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getChatbotResponse(userMessage) {
  try {
    // Tạo một mô hình Generative AI với tên "gemini-1.5-flash"
    // Sử dụng model gemini-1.5-flash (Tốc độ phản hồi cực nhanh, phù hợp làm chatbot)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    // Nối kịch bản ngầm với câu hỏi thực tế của khách hàng
    const prompt = `${systemInstruction}\n\nKhách hàng hỏi: "${userMessage}"\nHealthyBot trả lời:`;

    // Bấm gửi cho Google và đợi phản hồi
    const result = await model.generateContent(prompt);

    // Lấy phản hồi từ kết quả trả về
    const response = await result.response;

    return response.text(); // Trả về văn bản phản hồi từ AI
  } catch (error) {
    console.error("Lỗi khi kết nối Google Gemini AI:", error);
    throw new Error(
      "Xin lỗi, HealthyBot đang đi tưới rau. Bạn vui lòng thử lại sau vài phút nhé! 🌱",
    );
  }
}

module.exports = {
  getChatbotResponse,
};
