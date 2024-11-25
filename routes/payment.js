const express = require("express");
const { success, pay } = require("../controllers/payment");
const helper = require("../utilities/helper");
const router = express.Router();

router.post("/pay", helper.isAuthenticated, pay);

router.get("/success", helper.isAuthenticated, success);

module.exports = router;
