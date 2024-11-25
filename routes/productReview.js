const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { addReview, removeReview, listReview, unverifyReview } = require("../controllers/productReview");
const helper = require("../utilities/helper");

const reviewValidation = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .trim()
    .isLength({ max: 40 })
    .withMessage("Name should be less than 40 character"),
  check("rating")
    .trim()
];

router.post("/review", helper.isAuthenticated, reviewValidation, addReview);
router.get("/listreview", helper.isAuthenticated, helper.isAdmin, listReview);
router.post("/removereview", helper.isAuthenticated, helper.isAdmin, removeReview);
router.post("/unverifyreview", helper.isAuthenticated, helper.isAdmin, unverifyReview);

module.exports = router;
