const express = require("express");
const router = express.Router();
const fileHelper = require("../utilities/multerFunction");
const helper = require("../utilities/helper");
const {
  getOneBlog,
  listBlog,
  removeBlog,
  addBlog,
} = require("../controllers/blog");
const { bannerUpload } = require("../controllers/image");

router.post("/blog", helper.isAuthenticated, helper.isAdmin, addBlog);

router.post("/removeblog", helper.isAuthenticated, helper.isAdmin, removeBlog);
router.post("/banner", helper.isAuthenticated, helper.isAdmin, fileHelper.memoryUpload.single("file"), bannerUpload);

router.get("/getoneblog", getOneBlog);
router.get("/listblog", listBlog);

module.exports = router;
