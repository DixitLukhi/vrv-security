const express = require("express");
const router = express.Router();
const helper = require("../utilities/helper");
const { addDiscount, removeDiscount, listDiscount, getDiscount } = require("../controllers/categoryCatalogue");

router.post("/adddiscount", helper.isAuthenticated, helper.isAdmin, addDiscount);
router.post("/removediscount", helper.isAuthenticated, helper.isAdmin, removeDiscount);
router.get("/listdiscount", helper.isAuthenticated, helper.isAdmin, listDiscount);
router.get("/getdiscount", helper.isAuthenticated, helper.isAdmin, getDiscount);

module.exports = router;
