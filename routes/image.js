const express = require("express");
const router = express.Router();
const fileHelper = require("../utilities/multerFunction");
const helper = require("../utilities/helper");
const { imageUpload, videoUpload, removeMedia, profilePicUpload, thumbnailUpload, reviewUpload, excelUpload } = require("../controllers/image");
const multer = require("multer");

router.post("/excel", helper.isAuthenticated, helper.isAdmin, fileHelper.memoryUpload.single("file"), excelUpload);

router.post("/image", helper.isAuthenticated, helper.isAdmin, fileHelper.memoryUpload.single("file"), imageUpload);

router.post("/profile", helper.isAuthenticated, fileHelper.memoryUpload.single("file"), profilePicUpload);

router.post("/reviewphoto", fileHelper.memoryUpload.single("file"), reviewUpload);

router.post("/thumbnail", helper.isAuthenticated, helper.isAdmin, fileHelper.memoryUpload.single("file"), thumbnailUpload);

router.post("/removemedia", helper.isAuthenticated, helper.isAdmin, removeMedia);

module.exports = router;
