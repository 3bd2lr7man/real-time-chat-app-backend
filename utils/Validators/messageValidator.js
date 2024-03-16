const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const sendMessageValidator = [
  check("id").isMongoId().withMessage("Invalid Receiver Id"),
  validatorMiddleware,
];
const getMessagesValidator = [
  check("id").isMongoId().withMessage("Invalid -User To Chat- Id"),
  validatorMiddleware,
];
module.exports = { sendMessageValidator, getMessagesValidator };
