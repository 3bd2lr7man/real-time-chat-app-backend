const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");
const { getReceiverSocketId, io } = require("../socket/socket.js");

//
const sendMessage = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;
  if (senderId == receiverId)
    return next(
      new ApiError(
        "You can not send message to yourself try to send message to another user",
        400
      )
    );
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }

  await conversation.save();
  await newMessage.save();
  // SOCKET IO
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    // io.to(<socket_id>).emit() used to send events to specific client
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  res.status(201).json({
    status: "success",
    message: newMessage,
  });
});

const getMessages = asyncHandler(async (req, res, next) => {
  const { id: userToChatId } = req.params;
  const senderId = req.user._id;
  if (senderId == userToChatId)
    return next(
      new ApiError(
        "there is no messages with yourself because you can not send message to yourself",
        400
      )
    );
  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, userToChatId] },
  }).populate("messages");

  if (!conversation) return res.status(200).json([]);

  const messages = conversation.messages;

  res.status(200).json(messages);
});
module.exports = { sendMessage, getMessages };
