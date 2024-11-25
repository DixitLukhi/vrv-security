const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const fileHelper = require("../utilities/multerFunction");

const {
  addCategory,
  listCategory,
  removeCategory,
  addShobByStyleCategory,
  addShobByShapeCategory,
  addTopGiftIdeasCategory,
  addGiftsByOccasionCategory,
  removeGiftsByOccasionCategory,
  removeTopGiftIdeasCategory,
  removeShopByShapeCategory,
  removeShopByStyleCategory,
  getOneCategory,
} = require("../controllers/category");
const helper = require("../utilities/helper");
const { categoryPic } = require("../controllers/image");

const categoryValidation = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .trim()
    .isLength({ max: 40 })
    .withMessage("Category name should be less than 40 character"),
];

router.post(
  "/category",
  helper.isAuthenticated,
  helper.isAdmin,
  categoryValidation,
  addCategory
);

router.get("/category", listCategory);
router.get("/getonecategory", getOneCategory);

router.post(
  "/categorypic",
  helper.isAuthenticated,
  helper.isAdmin,
  fileHelper.memoryUpload.single("file"),
  categoryPic
);

router.post(
  "/removecategory",
  helper.isAuthenticated,
  helper.isAdmin,
  removeCategory
);

router.post(
  "/shopbystylecategory",
  helper.isAuthenticated,
  helper.isAdmin,
  addShobByStyleCategory
);

router.post(
  "/shopbyshapecategory",
  helper.isAuthenticated,
  helper.isAdmin,
  addShobByShapeCategory
);

router.post(
  "/topgiftideascategory",
  helper.isAuthenticated,
  helper.isAdmin,
  addTopGiftIdeasCategory
);

router.post(
  "/giftsbyoccasioncategory",
  helper.isAuthenticated,
  helper.isAdmin,
  addGiftsByOccasionCategory
);

router.post(
  "/removeshopbystylecategory",
  helper.isAuthenticated,
  helper.isAdmin,
  removeShopByStyleCategory
);

router.post(
  "/removeshopbyshapecategory",
  helper.isAuthenticated,
  helper.isAdmin,
  removeShopByShapeCategory
);

router.post(
  "/removetopgiftideascategory",
  helper.isAuthenticated,
  helper.isAdmin,
  removeTopGiftIdeasCategory
);

router.post(
  "/removegiftsbyoccasioncategory",
  helper.isAuthenticated,
  helper.isAdmin,
  removeGiftsByOccasionCategory
);

module.exports = router;
