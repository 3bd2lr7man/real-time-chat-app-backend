const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  protect,
  forgotPasswordViaEm,
  forgotPasswordViaPh,
  verifyPassResetCode,
  resetPassword,
} = require("../services/authService");
const {
  signupValidator,
  loginValidator,
} = require("../utils/Validators/authValidator");
router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/logout", protect, logout);
router.post("/forgotPasswordEm", forgotPasswordViaEm);
router.post("/forgotPasswordPh", forgotPasswordViaPh);
router.post("/verifyResetCode", verifyPassResetCode);
router.patch("/resetPassword", resetPassword);

// router.post("/checkprotect", protect, (req, res) => {
//   res.send("tmm");
// });
module.exports = router;
