const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const { decodeToken } = require("../services/authService");
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["*", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});
const userSocketMap = {}; // {userId: socketId}

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);
  //check token
  let token;
  if (
    socket.handshake.headers.authorization &&
    socket.handshake.headers.authorization.startsWith("Bearer")
  ) {
    token = socket.handshake.headers.authorization.split(" ")[1];
  }
  if (!token) {
    console.log(
      "user try to connect with invalid token and disconnected",
      socket.id
    );
    await io.to(socket.id).emit("exception", {
      errorMessage:
        "user try to connect with invalid token and The server has forcefully disconnected the user.",
    });
    socket.disconnect();
  }
  let userId;
  if (token) {
    userId = decodeToken(token);
    if (userId) {
      userSocketMap[userId] = socket.id;
    } else {
      console.log(
        "user try to connect with invalid token and disconnected",
        socket.id
      );
      socket.disconnect();
    }

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // socket.on() is used to listen to the events
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

module.exports = { app, io, server, getReceiverSocketId };
