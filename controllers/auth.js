const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");
var jwt = require("jsonwebtoken");
var { expressjwt } = require("express-jwt");
const { v4: uuidv4 } = require("uuid");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const helper = require("../utilities/helper");

const responseManager = require("../utilities/responseManager");
const { transporter } = require("../utilities/helper");

passport.use(User.createStrategy());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://api.goldtouchjewels.com/api/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      scope: ["profile", "email"],
    },
    function (accessToken, refreshToken, profile, cb) {
      const userData = profile._json;
      User.findOne({ email: userData.email })
        .lean()
        .then((user) => {
          if (user !== null && user.verified == true) {
            helper
              .generateAccessToken({
                userid: user._id.toString(),
              })
              .then((tok) => {
                return cb(null, user, { token: tok });
              })
              .catch((err) => {
                return cb(err, null);
              });
          } else { 
            User.findOrCreate(
              {
                googleId: userData.sub,
                first_name: userData.given_name,
                last_name: userData.family_name,
                email: userData.email,
                profile_pic: userData.picture,
                verified: true,
              }
            )
              .then(() => {
                User.findOne({ email: userData.email })
                  .lean()
                  .then((fuser) => {
                    let mailOptions = {
                      from: process.env.EMAIL, // Sender address
                      to: fuser.email, // List of recipients
                      subject: "Welcome To Gold Touch", // Subject line
                      // text: "Hello, Your otp is " + otp, // Plain text body
                      html: `<b>Hello ${fuser.first_name} ${fuser.last_name}, Welcome to Gold Touch!</b>`, // HTML body (optional)
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        // console.log("Error:", error);
                      } else {
                        // console.log("Email sent:", info.response);
                      }
                    });
                    helper
                      .generateAccessToken({
                        userid: new mongoose.Types.ObjectId(
                          fuser._id
                        ).toString(),
                      })
                      .then((tok) => {
                        return cb(null, fuser, { token: tok });
                      })
                      .catch((err) => {
                        return cb(err, null);
                      });
                    // return responseManager.onSuccess(
                  })
                  .catch((err) => {
                    // Handle errors
                    return cb(err, null);
                  });
              })
              .catch((err) => {
                // Handle errors
                return cb(err, null);
              });
          }
        });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const userData = await User.findOne({ email }).select("otp").lean();
    if (userData && userData != null) {
      const password = userData.otp;
      const dec_otp = await helper.passwordDecryptor(password);
      if (dec_otp == otp) {
        await User.findByIdAndUpdate(userData._id, {
          verified: true,
          otp: null,
        });
        return responseManager.onSuccess("User verified successfully", 1, res);
      } else {
        return responseManager.badrequest({ message: "Wrong otp" }, res);
      }
    } else {
      return responseManager.badrequest(
        { message: "User does not exist" },
        res
      );
    }
  } else {
    return responseManager.schemaError(errors.array()[0].msg, res);
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const userData = await User.findOne({ email })
      .select("email verified")
      .lean();
    if (userData && userData != null) {
      if (userData && userData.verified == true) {
        const otp = await helper.otpGenerator();

        let mailOptions = {
          from: process.env.EMAIL, // Sender address
          to: email, // List of recipients
          subject: "OTP", // Subject line
          text: "Hello, Your otp is " + otp, // Plain text body
          // html: "<b>Hello, this is a test email from <i>Node.js</i>!</b>" + otp, // HTML body (optional)
        };
        const enc_otp = await helper.passwordEncryptor(otp);
        await User.findByIdAndUpdate(userData._id, { otp: enc_otp });
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            // console.log("Error:", error);
          } else {
            // console.log("Email sent:", info.response);
          }
          return responseManager.onSuccess("Otp send successfully", 1, res);
        });
      } else {
        return responseManager.badrequest(
          { message: "User not verified" },
          res
        );
      }
    } else {
      return responseManager.badrequest(
        { message: "User does not exist" },
        res
      );
    }
  } else {
    return responseManager.schemaError(errors.array()[0].msg, res);
  }
};

exports.signup = async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { first_name, last_name, mobile, email, password } = req.body;
  // const noError =  await responseManager.schemaError(req, res);
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const enc_password = await helper.passwordEncryptor(password);
    const checkExisting = await User.findOne({ email: email }).lean();
    if (checkExisting == null) {
      const otp = await helper.otpGenerator();
      // console.log(otp);
      const enc_otp = await helper.passwordEncryptor(otp);

      const obj = {
        first_name: first_name,
        last_name: last_name,
        mobile: mobile,
        email: email,
        password: enc_password,
        verified: true,
        otp: enc_otp,
      };

      const data = await User.create(obj);

      let mailOptions = {
        from: process.env.EMAIL, // Sender address
        to: email, // List of recipients
        subject: "Welcome To Gold Touch", // Subject line
        // text: "Hello, Your otp is " + otp, // Plain text body
        html: `<b>Hello ${first_name} ${last_name}, Welcome to Gold Touch!</b>`, // HTML body (optional)
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          // console.log("Error:", error);
        } else {
          // console.log("Email sent:", info.response);
        }
        return responseManager.onSuccess(
          "User created successfully, please verify",
          {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            mobile: data.mobile,
            verified: data.verified,
          },
          res
        );
      });
    } else {
      if (checkExisting.verified == false) {
        const otp = await helper.otpGenerator();
        const enc_otp = await helper.passwordEncryptor(otp);

        const obj = {
          first_name: first_name,
          last_name: last_name,
          mobile: mobile,
          email: email,
          password: enc_password,
          verified: false,
          otp: enc_otp,
        };

        const data = await User.findByIdAndUpdate(checkExisting._id, obj);
        return responseManager.onSuccess(
          "User created successfully, please verify",
          {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            mobile: data.mobile,
            verified: data.verified,
          },
          res
        );
      } else {
        return responseManager.badrequest(
          { message: "User already exist" },
          res
        );
      }
    }
  } else {
    return responseManager.schemaError(errors.array()[0].msg, res);
  }
};

exports.signin = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
  );
  res.setHeader("Access-Control-Allow-Methods", "*");
  const { mobile, password, email } = req.body;

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const userData = await User.findOne({ email: email }).lean();
    if (userData && userData != null) {
      if (userData && userData !== null && userData.verified == true) {
        const userPassword = await helper.passwordDecryptor(userData.password);
        if (userPassword == password) {
          const getToken = await helper.generateAccessToken({
            userid: userData._id.toString(),
          });

          return responseManager.onSuccess(
            "User login successfully",
            { token: getToken },
            res
          );
        } else {
          return responseManager.badrequest(
            { message: "Invalid credentials" },
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "User not verified" },
          res
        );
      }
    } else {
      return responseManager.badrequest(
        { message: "User does not exist" },
        res
      );
    }
  } else {
    return responseManager.schemaError(errors.array()[0].msg, res);
  }
};

exports.makeAdmin = async (req, res) => {
  const { email } = req.body;

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const userData = await User.findOne({ email }).select("role").lean();
    if (userData && userData != null) {
      await User.findByIdAndUpdate(userData._id, {
        role: 1,
      });
      return responseManager.onSuccess("You are now admin", 1, res);
    } else {
      return responseManager.badrequest(
        { message: "User does not exist" },
        res
      );
    }
  }
  else {
    return responseManager.schemaError(errors.array()[0].msg, res);
  }
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const { old_password, new_password, email } = req.body;

    const userData = await User.findOne({ email })
      .select("email password")
      .lean();
    const dec_password = await helper.passwordDecryptor(userData.password);

    // if (dec_password == old_password) {
    const enc_password = await helper.passwordEncryptor(new_password);

    await User.findByIdAndUpdate(userData._id, {
      password: enc_password,
    });

    return responseManager.onSuccess("Password changed successfully", 1, res);
  } else {
    return responseManager.schemaError(errors.array()[0].msg, res);
  }
};

exports.unverifyUser = async (req, res) => {
  const { userid } = req.body;

  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    let userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      let userChangeData = await User.findById(userid)
        .select("verified")
        .lean();

      await User.findByIdAndUpdate(userid, {
        verified: !userChangeData.verified,
      });

      return responseManager.onSuccess("User status updated", 1, res);
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to update user" },
      res
    );
  }
};
