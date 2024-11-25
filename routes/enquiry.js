const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
  enquiry,
  listEnquiry,
  enquiryTaken,
  removeEnquiry,
} = require("../controllers/enquiry");
const { designPic } = require("../controllers/image");
const fileHelper = require("../utilities/multerFunction");
const helper = require("../utilities/helper");

const enquiryValidation = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .trim()
    .isLength({ max: 40 })
    .withMessage("Name should be less than 40 character"),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .isEmail()
    .withMessage("Email is not correct"),
];

router.post("/designpic", fileHelper.memoryUpload.single("file"), designPic);

router.post("/enquiry", enquiryValidation, enquiry);
router.get("/enquiry", helper.isAuthenticated, helper.isAdmin, listEnquiry);
router.post(
  "/enquirytaken",
  helper.isAuthenticated,
  helper.isAdmin,
  enquiryTaken
);
router.post(
  "/removeenquiry",
  helper.isAuthenticated,
  helper.isAdmin,
  removeEnquiry
);

module.exports = router;
