const express = require("express");
const router = express.Router();
const helper = require("../utilities/helper");
const { addCoupon, removeCoupon, listCoupon, getCoupon, validateCoupon } = require("../controllers/coupon");

router.post("/addcoupon", helper.isAuthenticated, helper.isAdmin, addCoupon);
router.post("/removecoupon", helper.isAuthenticated, helper.isAdmin, removeCoupon);
router.get("/listcoupon", helper.isAuthenticated, helper.isAdmin, listCoupon);
router.get("/getcoupon", helper.isAuthenticated, helper.isAdmin, getCoupon);
router.post("/validatecoupon", validateCoupon);

module.exports = router;
