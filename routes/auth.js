const express = require("express");
const router = express.Router();
const {
  signout,
  signup,
  signin,
  isSignedIn,
  verifyOtp,
  changePassword,
  forgotPassword,
  makeAdmin,
  unverifyUser,
} = require("../controllers/auth");
const { check } = require("express-validator");
const helper = require("../utilities/helper");
const responseManager = require("../utilities/responseManager");
const passport = require("passport");

const signUpValidation = [
  check("first_name")
    .notEmpty()
    .withMessage("First name is required")
    .trim()
    .isLength({ max: 40 })
    .withMessage("First name should be less than 40 character"),
  check("last_name")
    .notEmpty()
    .withMessage("Last name is required")
    .trim()
    .isLength({ max: 40 })
    .withMessage("Last name should be less than 40 character"),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .isEmail()
    .withMessage("Email is not correct"),
  check("mobile")
    .notEmpty()
    .withMessage("Mobile no is required")
    .trim()
    .isMobilePhone()
    .withMessage("Mobile no is not correct"),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Password should contain at least 3 character"),
];

const signInValidation = [
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Password should contain at least 3 character"),
];

const changePasswordValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .isEmail()
    .withMessage("Email is not correct"),
  check("new_password")
    .notEmpty()
    .withMessage("New password is required")
    .trim()
    .isLength({ min: 3 })
    .withMessage("New password should contain at least 3 character"),
];

const verifyOtpValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .isEmail()
    .withMessage("Email is not correct"),
  check("otp")
    .notEmpty()
    .withMessage("Otp is required")
    .trim()
    .isLength({ min: 4, max: 4 })
    .withMessage("Otp should be 4 character long"),
];

const forgotPasswordValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .isEmail()
    .withMessage("Email is not correct"),
];

const adminValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .isEmail()
    .withMessage("Email is not correct"),
];

router.get("/login/success", (req, res) => {
  // console.log(req);
  if (req.user) {
    return responseManager.onSuccess(
      "User logged in successfully",
      req.user,
      res
    );
  } else {
    return responseManager.unauthorisedRequest(res);
  }
});

router.get("/login/failed", (req, res) => {
  return responseManager.badrequest({ message: "Log in failed" }, res);
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failed",
  }),
  function (req, res) {
    // This function will be executed upon successful authentication
    const token = req.authInfo.token; // Access the token passed to the cb function
    // Send a response to the client
    console.log(`${process.env.GOOGLE_SUCCESS_REDIRECT}?token=${token}`);
    res.redirect(`${process.env.GOOGLE_SUCCESS_REDIRECT}?token=${token}`);
  }
);

router.get("/logout", (req, res) => {
  try {
    req.logOut(); // Log the user out
    res.redirect(process.env.CLIENT_URL); // Redirect to the specified URL after logout
  } catch (error) {
    console.error("Logout error:", error);
    // Handle the error and send a response
    res.status(500).json({ message: "Logout error", error: error.message });
  }
});
router.post("/signup", signup);

router.post("/signin", signInValidation, signin);

router.post("/admin", adminValidation, makeAdmin);

router.post("/forgotpassword", forgotPasswordValidation, forgotPassword);

router.post("/changepassword", changePasswordValidation, changePassword);

router.post(
  "/unverifyuser",
  helper.isAuthenticated,
  helper.isAdmin,
  unverifyUser
);

router.post("/verifyotp", verifyOtpValidation, verifyOtp);

module.exports = router;
