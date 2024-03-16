const ApiError = require("../utils/apiError");

const JsonWebTokenError = () => {
  return new ApiError(
    "Authentication failed. Invalid token signature. Please log in again",
    401
  );
};

const errForDev = (err, res, status) => {
  return res.status(err.statusCode).json({
    status: status,
    message: err.message,
    err: err,
    stack: err.stack,
  });
};

const errForProd = (err, res, status) => {
  return res.status(err.statusCode).json({
    status: status,
    message: err.message,
  });
};
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  let status = `${err.statusCode}`.startsWith(4) ? "error" : "fail";
  if (process.env.NODE_ENV == "production") {
    if (
      err.name == "JsonWebTokenError" ||
      err.message == "secretOrPrivateKey must have a value"
    )
      err = JsonWebTokenError();
    errForProd(err, res, status);
  } else {
    if (
      err.name == "JsonWebTokenError" ||
      err.message == "secretOrPrivateKey must have a value"
    )
      err = JsonWebTokenError();
    errForDev(err, res, status);
  }
};
module.exports = globalError;
