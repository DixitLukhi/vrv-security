const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const responseManager = require("../utilities/responseManager");
const { default: mongoose } = require("mongoose");
const { User } = require("../models/user");
const Counter = require("../models/counter");
// var { expressjwt } = require("express-jwt");
const nodemailer = require("nodemailer");

exports.otpGenerator = async () => {
  let digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

exports.metalIdGenerator = async () => {
  let n = 1;
  const count = await Counter.find()
    .select("product metal")
    .lean()
    .then((c) => {
      return c;
    })
    .catch((e) => {
      return e;
    });
  await Counter.findByIdAndUpdate(count[0]._id, {
    metal: count[0].metal + 1,
    product: count[0].product,
  });
  n = count[0].metal + 1;

  const paddedIndex = n.toString().padStart(5, "0");
  const ID = `GT${paddedIndex}`;

  return ID;
};

exports.productIdGenerator = async () => {
  let n = 1;
  const count = await Counter.find()
    .select("product metal")
    .lean()
    .then((c) => {
      return c;
    })
    .catch((e) => {
      return e;
    });
  if (count.length == 0) {
    const obj = {
      metal: 0,
      product: n,
    };
    await Counter.create(obj);
  } else {
    await Counter.findByIdAndUpdate(count[0]._id, {
      product: count[0].product + 1,
      metal: count[0].metal,
    });
    n = count[0].product + 1;
  }

  const paddedIndex = n.toString().padStart(4, "0");
  const ID = `GTP${paddedIndex}`;

  return ID;
};

exports.passwordEncryptor = async (password) => {
  const encLayer1 = CryptoJS.AES.encrypt(
    password,
    process.env.PASSWORD_ENC
  ).toString();
  const encLayer2 = CryptoJS.DES.encrypt(
    encLayer1,
    process.env.PASSWORD_ENC
  ).toString();
  const finalEncPassword = CryptoJS.TripleDES.encrypt(
    encLayer2,
    process.env.PASSWORD_ENC
  ).toString();
  return finalEncPassword;
};

exports.passwordDecryptor = async (password) => {
  const decLayer1 = CryptoJS.TripleDES.decrypt(
    password,
    process.env.PASSWORD_ENC
  );
  var deciphertext1 = decLayer1.toString(CryptoJS.enc.Utf8);
  var decLayer2 = CryptoJS.DES.decrypt(deciphertext1, process.env.PASSWORD_ENC);
  var deciphertext2 = decLayer2.toString(CryptoJS.enc.Utf8);
  const decLayer3 = CryptoJS.AES.decrypt(
    deciphertext2,
    process.env.PASSWORD_ENC
  );
  const finalDecPassword = decLayer3.toString(CryptoJS.enc.Utf8);
  return finalDecPassword;
};

exports.generateAccessToken = async (userData) => {
  return jwt.sign(userData, process.env.LOGIN_SECRET, { expiresIn: "7d" });
};

exports.isAuthenticated = async (req, res, next) => {
  const bearerToken = req.headers["authorization"];
  if (typeof bearerToken !== "undefined") {
    const bearer = bearerToken.split(" ");
    const token = bearer[1];

    jwt.verify(token, process.env.LOGIN_SECRET, (err, auth) => {
      if (err) {
        return responseManager.unauthorisedRequest(res);
      } else {
        req.token = auth;
      }
    });
    next();
  } else {
    return responseManager.unauthorisedRequest(res);
  }
};

exports.isAdmin = async (req, res, next) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("role verified")
      .lean();

    if (userData && userData.verified == true) {
      if (userData && userData.role != 1) {
        return responseManager.unauthorisedRequest(res);
      }
      next();
    } else {
      return responseManager.badrequest({ message: "Admin not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token for admin" },
      res
    );
  }
};

exports.transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email provider's SMTP service
  auth: {
    user: "goldtouchjewells@gmail.com", // Your email address
    pass: "euzgkmgfyaeaavhd", // Your email password
    // user: process.env.EMAIL, // Your email address
    // pass: process.env.MAIL_PASSWORD, // Your email password
  },
});