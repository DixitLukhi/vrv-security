const express = require("express");
const router = express.Router();

const {
  getUser,
  updateUser,
  getAllUser,
  address,
  removeAddress,
  listAddress,
  removeUser
} = require("../controllers/user");
const helper= require("../utilities/helper");
const { check } = require("express-validator");
const { addToWishlist, listWishlist, listAllWishlist, checkWishlist } = require("../controllers/wishlistProduct");
const { listCart, AddToCart, listAllCart, removeFromCart } = require("../controllers/addToCartProduct");

const userUpdateValidation = [
    check("first_name")
      .notEmpty()
      .withMessage("First name is required")
      .trim()
      .isLength({ max: 40 })
      .withMessage("First name should be less than 40 character"),
    check("last_name")
      .notEmpty()
      .withMessage("Last name is required")
      .trim()
      .isLength({ max: 40 })
      .withMessage("Last name should be less than 40 character"),
    check("email")
      .notEmpty()
      .withMessage("Email is required")
      .trim()
      .isEmail()
      .withMessage("Email is not correct"),
  ];
// router.param("userId", getUserById);

router.get("/user", helper.isAuthenticated, getUser);
router.get("/getalluser", helper.isAuthenticated, helper.isAdmin, getAllUser);
router.post("/user", helper.isAuthenticated, userUpdateValidation, updateUser);
router.post("/removeuser", helper.isAuthenticated, helper.isAdmin, removeUser);

router.post("/address", helper.isAuthenticated, address);
router.get("/address", helper.isAuthenticated, listAddress);
router.post("/removeaddress", helper.isAuthenticated, removeAddress);


router.post("/addtocart", helper.isAuthenticated, AddToCart);

router.post("/removefromcart", helper.isAuthenticated, removeFromCart);

router.post("/addtowishlist", helper.isAuthenticated, addToWishlist);

router.get("/listcart", helper.isAuthenticated, listCart);

router.get("/listallcart", helper.isAuthenticated, helper.isAdmin, listAllCart);

router.get("/listwishlist", helper.isAuthenticated, listWishlist);

router.get("/listallwishlist", helper.isAuthenticated, helper.isAdmin, listAllWishlist);

router.post("/checkwishlist", helper.isAuthenticated, checkWishlist);

module.exports = router;
