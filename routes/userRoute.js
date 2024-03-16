const express = require("express");
const router = express.Router();
const { protect } = require("../services/authService");
const { getAllUsers, changeAvatar } = require("../services/userService");
router.get("/", protect, getAllUsers);
router.post("/changeuseravatar", protect, changeAvatar);
module.exports = router;
