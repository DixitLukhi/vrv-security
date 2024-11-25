const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { addMetaTag, listMetaTag } = require("../controllers/metaTag");
const helper = require("../utilities/helper");

const metaTagValidation = [
  check("page").trim(),
  check("meta_title")
    .trim()
    .isLength({ max: 60 })
    .withMessage("Meta title should be less than 60 character"),
  check("meta_description")
    .trim()
    .isLength({ max: 160 })
    .withMessage("Meta description should be less than 160 character"),
];

router.post(
  "/metatag",
  helper.isAuthenticated,
  helper.isAdmin,
  metaTagValidation,
  addMetaTag
);

router.get("/listmetatag", listMetaTag);

module.exports = router;
