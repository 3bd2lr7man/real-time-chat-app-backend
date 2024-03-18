const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const bcryprt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const sendSms = require("../utils/sendSms");
//
const createToken = (id) => {
  const token = jwt.sign({ UserId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.EXPIRES_IN,
  });
  return token;
};
const decodeToken = (token) => {
  const tokenDecode = jwt.verify(token, process.env.JWT_SECRET_KEY);
  return tokenDecode.UserId;
};
const signup = asyncHandler(async (req, res, next) => {
  const { username, gender, email, phonenumber, password } = req.body;
  const checkUser = await User.findOne({
    $or: [
      { username: username },
      { email: email },
      { phonenumber: phonenumber },
    ],
  });
  if (checkUser)
    return next(
      new ApiError(
        "the phone number, email, or username you entered is already associated with an existing account ",
        400
      )
    );
  const hashedPassword = await bcryprt.hash(password, 7);
  const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
  const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
  const userData = await User.create({
    username,
    password: hashedPassword,
    email,
    phonenumber,
    gender,
    profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
  });
  res.json({
    status: "success",
    data: userData,
  });
});
const login = asyncHandler(async (req, res, next) => {
  const data = await User.findOne({ email: req.body.email });
  if (!data)
    next(
      new ApiError(
        "No account found with the provided email. Please ensure your email is correct or sign up for a new account",
        404
      )
    );
  const checkPassword = await bcryprt.compare(
    `${req.body.password}`,
    data.password
  );
  if (checkPassword) {
    data.active = true;
    await data.save();
    res.json({
      status: "success",
      message: `Welcome back ${data.username}`,
      token: createToken(data._id),
    });
  } else {
    return next(new ApiError("Invalid email or password", 401));
  }
});
const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.active = false;
  await user.save();
  res.status(200).json({ status: "success" });
});
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, Please login to get access this route",
        401
      )
    );
  }
  const tokenDecode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  const checkUser = await User.findById(tokenDecode.UserId);
  if (!checkUser)
    next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  req.user = checkUser;
  next();
});
const checkUserAnResetCd = asyncHandler(async (req) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();
  return { user: user, resetCode: resetCode };
});
const forgotPasswordViaEm = asyncHandler(async (req, res, next) => {
  const { user, resetCode } = await checkUserAnResetCd(req);
  // 3) Send the reset code via email
  const message = `Hi ${user.username},\n We received a request to reset the password on your Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message: message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});
const forgotPasswordViaPh = asyncHandler(async (req, res, next) => {
  const { user, resetCode } = await checkUserAnResetCd(req);
  // 3) Send the reset code via email
  const message = `Hi ${user.username},\n We received a request to reset the password on your Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n`;
  try {
    sendSms(user.phonenumber, message);
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    console.log(">>", err);
    return next(new ApiError("There is an error in sending SMS", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to phonenumber" });
});
const verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "Success",
  });
});
const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }
  const hashedNewPass = await bcryprt.hash(req.body.newPassword, 7);
  user.password = hashedNewPass;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  // const token = createToken(user._id);
  res.status(200).json({ message: "password rested successfully" });
});

module.exports = {
  signup,
  login,
  logout,
  protect,
  forgotPasswordViaEm,
  forgotPasswordViaPh,
  verifyPassResetCode,
  resetPassword,
  resetPassword,
  decodeToken,
};
