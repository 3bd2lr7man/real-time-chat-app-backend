const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const signupValidator = [
  check("username")
    .isLength({ min: 3 })
    .withMessage("Username should be at least 3 characters long."),
  check("email").isEmail().withMessage("Invalid email address."),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long."),
  check("phonenumber")
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid phone number format (assuming Egyptian)."),
  check("gender").isIn(["male", "female"]).withMessage("Invalid gender."),
  validatorMiddleware,
];
const loginValidator = [
  check("email").isEmail().withMessage("Invalid email address."),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long."),
  validatorMiddleware,
];
module.exports = {
  signupValidator,
  loginValidator,
};
