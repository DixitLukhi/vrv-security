const express = require("express");
const router = express.Router();

const {
  addProduct,
  getOneProduct,
  listProduct,
  listWishlist,
  listCart,
  addToWishlist,
  addToCart,
  removeProduct,
  searchProduct,
  listUserSideProduct,
  searchAdminProduct,
  searchAdminMetal,
  changeProductStatus,
  changeInAllProduct,
} = require("../controllers/product");
const helper = require("../utilities/helper");

router.post("/product", helper.isAuthenticated, helper.isAdmin, addProduct);

router.get("/listproduct", listProduct);

router.get("/listusersideproduct", listUserSideProduct);

router.get("/getoneproduct", getOneProduct);

router.post("/removeproduct", helper.isAuthenticated, helper.isAdmin, removeProduct);

router.post("/search", searchProduct);

router.post("/searchadminproduct", searchAdminProduct);

router.post("/changeinallproduct", helper.isAuthenticated, helper.isAdmin, changeInAllProduct);

router.post("/changeproductstatus", helper.isAuthenticated, helper.isAdmin, changeProductStatus);

module.exports = router;
