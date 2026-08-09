const { handleChatRequest } = require("../controllers/chat.controller");
const express = require("express");
const router = express.Router();

// Tạo route cho chat
router.post("/chat", handleChatRequest);

module.exports = router;
