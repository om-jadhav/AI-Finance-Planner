const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { chat } = require("../controllers/chat.controller");

const router = express.Router();

// Isolated route file for the chatbot feature -- kept separate from
// profile.routes.js since this is an additive, independent feature.
router.post("/chat", requireAuth, chat);

module.exports = router;
