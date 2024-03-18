const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const morgan = require("morgan");
const dbConnection = require("./config/database.js");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const cors = require("cors");
//Routers
const authRoute = require("./routes/authRoute.js");
const messageRoute = require("./routes/messageRoute.js");
const userRoute = require("./routes/userRoute.js");

// Connect with db
dbConnection();

// express app & server from socket
const { app, server } = require("./socket/socket.js");
app.use(cors());

// Middlewares
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/users", userRoute);
//
app.all("*", (req, res, next) => {
  next(new ApiError(`cant find this route: ${req.originalUrl}`, 404));
});
//
app.use(globalError);
//
const port = process.env.PORT;
app.get("/", (req, res) => res.send("server running"));
server.listen(port, () => console.log(`app listening on port ${port}!..`));

// Handle rejection outside express
