const { getChatbotResponse } = require("../services/chat.service");

const handleChatRequest = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập câu hỏi của bạn." });
    }

    // Gọi Service đi hỏi AI
    const reply = await getChatbotResponse(message);

    // Trả câu trả lời về cho Frontend hiển thị
    res.status(200).json({ reply: reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleChatRequest,
};
