const express = require("express");
const router = express.Router();
const { protect } = require("../services/authService");
const { getAllUsers, changeProfilePic } = require("../services/userService");
router.get("/", protect, getAllUsers);
// router.post("/changeuseravatar", protect, changeAvatar);
router.post("/changeProfilePic", protect, changeProfilePic);
module.exports = router;
