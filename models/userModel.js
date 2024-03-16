const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true, unique: true },
    phonenumber: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    password: { type: String, required: true, minlengthe: 6 },
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    active: {
      type: Boolean,
      default: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
