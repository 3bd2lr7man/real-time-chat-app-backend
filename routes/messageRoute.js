const express = require("express");
const router = express.Router();
const {
  getMessagesValidator,
  sendMessageValidator,
} = require("../utils/Validators/messageValidator");
const { protect } = require("../services/authService");
const { sendMessage, getMessages } = require("../services/messageServices");
router.post("/send/:id", sendMessageValidator, protect, sendMessage);
router.get("/:id", getMessagesValidator, protect, getMessages);
module.exports = router;
