const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
 const { User } = require("../models/user");
const CategoryCatalogue = require("../models/categoryCatalogue");

exports.addDiscount = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid).select("verified").lean();
    if (userData && userData.verified == true) {
      const { discountid, rule, description, start_time, end_time, discount, amount, change, status, restriction } = req.body;
      if (discountid && discountid != "" && mongoose.Types.ObjectId.isValid(discountid)) {
        const obj = {
          rule: rule,
          description: description,
          start_time: start_time,
          end_time: end_time,
          discount: discount,
          amount: amount,
          change: change,
          status: status,
          restriction: restriction,
        };
        await CategoryCatalogue.findByIdAndUpdate(discountid, obj);
        const discountData = await CategoryCatalogue.findById(discountid).select("-createdAt -updatedAt -__v").lean();
        return responseManager.onSuccess("Discount updated", discountData, res);
      } else {
        const obj = {
          rule: rule,
          description: description,
          start_time: start_time,
          end_time: end_time,
          discount: discount,
          amount: amount,
          change: change,
          status: status,
          restriction: restriction,
        };
        const discountData = await CategoryCatalogue.create(obj);
        return responseManager.onSuccess("Discount added successfully", discountData, res);
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest({ message: "Invalid token to add coupon" }, res );
  }
};

exports.listDiscount = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      CategoryCatalogue.find()
        .select("-createdAt -__v")
        .sort({ _id: -1 })
        .lean()
        .then((discountData) => {
          return responseManager.onSuccess("Discount list", discountData, res);
        })
        .catch((error) => {
          return responseManager.onError(error, res);
        });
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to remove coupon" },
      res
    );
  }
};

exports.getDiscount = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { discountid } = req.query;
      if (
        discountid &&
        discountid != "" &&
        mongoose.Types.ObjectId.isValid(discountid)
      ) {
        const discountData = await CategoryCatalogue.findById(discountid)
          .select("-createdAt -updatedAt -__v")
          .lean();
        if (discountData && discountData != null) {
          return responseManager.onSuccess("Discount data", discountData, res);
        } else {
          return responseManager.badrequest(
            { message: "Invalid discount id" },
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "Invalid discount id" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to remove discount" },
      res
    );
  }
};

exports.removeDiscount = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { discountid } = req.body;

      if (
        discountid &&
        discountid != "" &&
        mongoose.Types.ObjectId.isValid(discountid)
      ) {
        await CategoryCatalogue.findByIdAndRemove(discountid);
        return responseManager.onSuccess("Discount removed successfully", 1, res);
      } else {
        return responseManager.badrequest(
          { message: "Invalid discount id to remove coupon" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to remove coupon" },
      res
    );
  }
};
