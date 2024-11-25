const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const helper = require("../utilities/helper");
const { addMetalCategory, listMetalCategory, getOneMetalCategory, removeMetalCategory, addMetalDiamondType, addMetalMaterial, removeMetalDiamondType, removeMetalMaterial } = require("../controllers/metalCategory");

const categoryValidation = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .trim()
    .isLength({ max: 40 })
    .withMessage("Category name should be less than 40 character"),
];

router.post(
  "/metalcategory",
  helper.isAuthenticated,
  helper.isAdmin,
  categoryValidation,
  addMetalCategory
);

router.get("/metalcategory", helper.isAuthenticated, helper.isAdmin, listMetalCategory);
router.get("/getonemetalcategory", getOneMetalCategory);

router.post(
  "/removemetalcategory",
  helper.isAuthenticated,
  helper.isAdmin,
  removeMetalCategory
);

router.post(
  "/metaldiamondtype",
  helper.isAuthenticated,
  helper.isAdmin,
  addMetalDiamondType
);

router.post(
  "/metalmaterial",
  helper.isAuthenticated,
  helper.isAdmin,
  addMetalMaterial
);

router.post(
  "/removemetaldiamondtype",
  helper.isAuthenticated,
  helper.isAdmin,
  removeMetalDiamondType
);

router.post(
  "/removemetalmaterial",
  helper.isAuthenticated,
  helper.isAdmin,
  removeMetalMaterial
);

module.exports = router;
