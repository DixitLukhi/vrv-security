const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const MetaTag = require("../models/metaTag");
const { User  }= require("../models/user");

exports.addMetaTag = async (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
      const userData = await User.findById(req.token.userid)
        .select("verified role")
        .lean();
      if (userData && userData.verified == true) {
        const { metaid, page, meta_title, meta_description } = req.body;

        if (metaid && metaid != "" && mongoose.Types.ObjectId.isValid(metaid)) {
          const obj = {
            page: page,
            meta_title: meta_title,
            meta_description: meta_description,
          };
          await MetaTag.findByIdAndUpdate(metaid, obj);

          let metaTagData = await MetaTag.findById(metaid)
            .select("-createdAt -updatedAt -__v")
            .lean();
          return responseManager.onSuccess(
            "Meta tag updated",
            metaTagData,
            res
          );
        } else {
          const obj = {
            page: page,
            meta_title: meta_title,
            meta_description: meta_description,
          };
          const metaTagData = await MetaTag.create(obj);
          return responseManager.onSuccess(
            "Meta tag created successfully!",
            metaTagData,
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "User not verified" },
          res
        );
      }
    } else {
      return responseManager.badrequest(
        { message: "Invalid token to add category" },
        res
      );
    }
  } else {
    return responseManager.schemaError(errors.array()[0].msg, res);
  }
};

exports.listMetaTag = async (req, res) => {
  const { page } = req.query;

  MetaTag.find({ page: page })
    .select("-createdAt -updatedAt -__v")
    .sort({ _id: -1 })
    .lean()
    .then((metaTagData) => {
      return responseManager.onSuccess("Meta tag list", metaTagData, res);
    })
    .catch((error) => {
      return responseManager.onError(error, res);
    });
};
