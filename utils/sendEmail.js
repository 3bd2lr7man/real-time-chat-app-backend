nodemailer = require("nodemailer");
const { google } = require("googleapis");
const clientId = process.env.GA_CLIENT_ID;
const clientSecret = process.env.GA_CLIENT_SECRET;
const refresh_Token = process.env.GA_REFRESH_TOKEN;

const OAuth2 = google.auth.OAuth2;
const oAuth2_clint = new OAuth2(clientId, clientSecret);
oAuth2_clint.setCredentials({ refresh_token: refresh_Token });

const sendEmail = (options) => {
  const accessToken = oAuth2_clint.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "oAuth2",
      user: "dyaaabdelrahman5@gmail.com",
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refresh_Token,
      accessToken: accessToken,
    },
  });
  const mailOption = {
    from: "Chat-Application-ITI <Abdelrhman>",
    to: options.to,
    subject: options.subject,
    text: options.message,
  };
  console.log(mailOption);
  transporter.sendMail(mailOption, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
  transporter.close();
};
module.exports = sendEmail;
