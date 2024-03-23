const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

//
const getAllUsers = asyncHandler(async (req, res, next) => {
  const AllUsers = await User.find(
    {},
    "-password -__v -passwordResetCode -passwordResetExpires -passwordResetVerified"
  );
  res.status(200).json({
    status: "success",
    users: AllUsers,
  });
});

// const changeAvatar = asyncHandler(async (req, res, next) => {
//   const userId = req.user._id;
//   const user = await User.findById(userId);
//   const Random6D = Math.floor(100000 + Math.random() * 900000).toString();
//   const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${Random6D}`;
//   const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${Random6D}`;
//   user.profilePic = user.gender === "male" ? boyProfilePic : girlProfilePic;
//   await user.save();
//   res.status(200).json({
//     statuss: "success",
//     message: "user avatar changed successfully ",
//     newAvatar: user.profilePic,
//   });
// });

const changeProfilePic = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  const newProfilePic = req.body.newProfilePic;
  user.profilePic = newProfilePic;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "user profile picture changed successfully ",
    newProfilePic: user.profilePic,
  });
});

module.exports = { getAllUsers, changeProfilePic };
