const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const async = require("async");
const Metal = require("../models/metal");
const Review = require("../models/productReview");
const { idGenerator, productIdGenerator } = require("../utilities/helper");

exports.listOrder = async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
    .select("verified role")
    .lean();
  if (userData && userData.verified == true) {

    const { page, limit } = req.query;

      const p = Number(page) ? Number(page) : 1;
      const l = Number(limit) ? Number(limit) : 10;

      await Order.countDocuments()
      .then((totalRecords) => {
        return Order.find()
        .skip((p - 1) * l)
            .limit(l)
            .lean()
        .select("-products -createdAt -updatedAt -__v")
        .sort({ _id: -1 })
        .then((data) => {
          return responseManager.onSuccess("Order list", {list: data, total: totalRecords}, res);
        })
        .catch((error) => {
          return responseManager.onError(error, res);
        }); 
      })
  } else {
    return responseManager.badrequest({ message: "User not verified" }, res);
  }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to list cart" },
      res
    );
  }
};

exports.listUserOrder = async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();

    if (userData && userData.verified == true) {
      User.findById(req.token.userid)
        .select("purchases")
        .sort({ _id: -1 })
        .lean()
        .then((orderData) => {
          return responseManager.onSuccess("Order list", orderData, res);
        })
        .catch((error) => {
          return responseManager.onError(error, res);
        });
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to add product" },
      res
    );
  }
};

exports.getOneOrder = async (req, res) => {
  const { orderid } = req.body;
  if (orderid && orderid != "" && mongoose.Types.ObjectId.isValid(orderid)) {
    const orderData = await Order.findById(orderid)
      .select("-createdAt -updatedAt -__v")
      .lean();
    if (orderData && orderData != null) {
      return responseManager.onSuccess("Order data", orderData, res);
    } else {
      return responseManager.badrequest({ message: "Invalid order id" }, res);
    }
  } else {
    return responseManager.badrequest({ message: "Invalid order id" }, res);
  }
};

exports.checkUser = async (req, res) => {

  const { email } = req.body;

  const userData = await User.findOne({email: email}).select("verified").lean();

  if (userData && userData != null && userData.verified == true) {
    return responseManager.onSuccess("This email is associated with an account, Please login.", {user: "present"}, res);
  } else if (userData && userData != null && userData.verified == false){
    return responseManager.badrequest({ message: "This email is not verified, Please contact admin." }, res);
  } else {
    return responseManager.onSuccess("You can create order.", {user: "not_present"}, res);
  }
};
    