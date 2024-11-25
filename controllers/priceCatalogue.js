const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
 const { User } = require("../models/user");
const Coupon = require("../models/coupon");

exports.addCoupon = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { couponid, rule, description, start_time, end_time, discount } = req.body;

      if (
        couponid &&
        couponid != "" &&
        mongoose.Types.ObjectId.isValid(blogid)
      ) {
        const obj = {
          rule: rule,
          description: description,
          start_time: start_time,
          end_time: end_time,
          discount: discount
        };
        await Coupon.findByIdAndUpdate(couponid, obj);

        let couponData = await Coupon.findById(couponid)
          .select("-createdAt -updatedAt -__v")
          .lean();
        return responseManager.onSuccess("Coupon updated", couponData, res);
      } else {
        const obj = {
          rule: rule,
          description: description,
          start_time: start_time,
          end_time: end_time,
          discount: discount
        };
        const couponData = await Coupon.create(obj);

        return responseManager.onSuccess(
          "Coupon added successfully",
          couponData,
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to add coupon" },
      res
    );
  }
};

exports.listCoupon = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      Coupon.find()
        .select("-createdAt -__v")
        .sort({ _id: -1 })
        .lean()
        .then((couponData) => {
          return responseManager.onSuccess("Coupon list", couponData, res);
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

exports.getCoupon = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { couponid } = req.query;
      if (
        couponid &&
        couponid != "" &&
        mongoose.Types.ObjectId.isValid(couponid)
      ) {
        const couponData = await Coupon.findById(couponid)
          .select("-createdAt -updatedAt -__v")
          .lean();
        if (couponData && couponData != null) {
          return responseManager.onSuccess("Coupon data", couponData, res);
        } else {
          return responseManager.badrequest(
            { message: "Invalid coupon id" },
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "Invalid coupon id" },
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

exports.removeCoupon = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { couponid } = req.body;

      if (
        couponid &&
        couponid != "" &&
        mongoose.Types.ObjectId.isValid(couponid)
      ) {
        await Coupon.findByIdAndRemove(couponid);
        return responseManager.onSuccess("Coupon removed successfully", 1, res);
      } else {
        return responseManager.badrequest(
          { message: "Invalid blog id to remove coupon" },
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
