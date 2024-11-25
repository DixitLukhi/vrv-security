const mongoose = require("mongoose");
const Enquiry = require("../models/enquiry");
const responseManager = require("../utilities/responseManager");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const { User } = require("../models/user");

exports.enquiry = async (req, res) => {
  const { name, email, mobile, message, productid, product_name, design } =
    req.body;

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const obj = {
      productid: productid,
      product_name: product_name,
      design: design,
      name: name,
      email: email,
      mobile: mobile,
      message: message,
      taken: false
    };
    await Enquiry.create(obj);

    return responseManager.onSuccess(
      "Your enquiry has been sent successfully",
      1,
      res
    );
  } else {
    return responseManager.schemaError(errors.array()[0].msg, res);
  }
};

exports.listEnquiry = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();
    const { page, limit } = req.query;
    const p = Number(page) ? Number(page) : 1;
    const l = Number(limit) ? Number(limit) : 10;

    if (userData && userData.verified == true) {
      Enquiry.countDocuments()
        .then((totalRecords) => {
          return (
            Enquiry.find()
              .sort({ _id: -1 })
              .skip((p - 1) * l)
              .limit(l)
              .lean()
              .then((enquiryList) => {
                return responseManager.onSuccess(
                  "Enquiry list",
                  { list: enquiryList, total: totalRecords },
                  res
                );
              })
              .catch((error) => {
                return responseManager.onError(error, res);
              })
          );
        })
        .catch((error) => {
          return responseManager.onError(error, res);
        });
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to get user list" },
      res
    );
  }
};

exports.enquiryTaken = async (req, res) => {
  const { enquiryid } = req.body;

  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    let userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      let enquiryData = await Enquiry.findById(enquiryid)
        .select("taken")
        .lean();

      await Enquiry.findByIdAndUpdate(enquiryid, {
        taken: !enquiryData.taken,
      });

      return responseManager.onSuccess("Enquiry status updated", 1, res);
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to update user" },
      res
    );
  }
};

exports.removeEnquiry = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { enquiryid } = req.body;

      if (
        enquiryid &&
        enquiryid != "" &&
        mongoose.Types.ObjectId.isValid(enquiryid)
      ) {
        await Enquiry.findByIdAndRemove(enquiryid);
        return responseManager.onSuccess(
          "Enquiry removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          { message: "Invalid enquiryid id to remove enquiry" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to remove category" },
      res
    );
  }
};
 