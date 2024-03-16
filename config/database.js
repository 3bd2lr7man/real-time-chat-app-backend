const mongoose = require("mongoose");
const connect = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      if (process.env.NODE_ENV === "development") {
        console.log("DB connected :)");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connect;
