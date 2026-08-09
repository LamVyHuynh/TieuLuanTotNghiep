const { getChatbotResponse } = require("../services/chat.service");

const handleChatRequest = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập câu hỏi của bạn." });
    }

    // result bây giờ là một Object: { reply: "...", products: [...] }
    const result = await getChatbotResponse(message);

    // Trả thẳng nguyên object về cho Frontend
    res.status(200).json(result);
  } catch (error) {
    // Xử lý lỗi trả về UI gọn gàng
    res.status(500).json({ reply: error.message });
  }
};

module.exports = { handleChatRequest };
