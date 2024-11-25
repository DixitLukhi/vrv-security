const express = require("express");
const router = express.Router();

const { addMetal, getOneMetal, removeMetal, listMetal, searchAdminMetal } = require("../controllers/metal");
const helper = require("../utilities/helper");
const { check } = require("express-validator");

const getMetalValidation = [
  check("productid").notEmpty().withMessage("Product id is required").trim(),
  check("metal").notEmpty().withMessage("Metal name is required").trim(),
];

router.post("/metal", helper.isAuthenticated, helper.isAdmin, addMetal);

router.post(
  "/removemetal",
  helper.isAuthenticated,
  helper.isAdmin,
  removeMetal
);

router.get("/getonemetal", getMetalValidation, getOneMetal);
router.get("/listmetal", helper.isAuthenticated, helper.isAdmin, listMetal);

router.post("/searchadminmetal", searchAdminMetal);

module.exports = router;
