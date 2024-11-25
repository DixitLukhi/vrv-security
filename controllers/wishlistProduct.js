const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const Wishlist = require("../models/wishlistProduct");
const { User } = require("../models/user");
const Product = require("../models/product");
const Metal = require("../models/metal");
const async = require("async");

exports.addToWishlist = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { metalid, material_wise } = req.body;

      if (
        metalid &&
        metalid != "" &&
        mongoose.Types.ObjectId.isValid(metalid)
      ) {
        const existingData = await Wishlist.findOne({
          metalid: metalid,
          userid: req.token.userid,
          material_wise: material_wise,
        })
          .select("-createdAt -updatedAt -__v")
          .lean();

        if (existingData == null) {
          const obj = {
            metalid: metalid,
            userid: req.token.userid,
            material_wise: material_wise,
          };

          await Wishlist.create(obj);
          return responseManager.onSuccess("Product added in wishlist", 1, res);
        } else {
          await Wishlist.findOneAndRemove({
            metalid: metalid,
            userid: req.token.userid,
            material_wise: material_wise,
          }).lean();
          return responseManager.onSuccess(
            "Product removed from wishlist",
            1,
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "Invalid productid" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token for add to wishlist" },
      res
    );
  }
};

exports.listWishlist = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      try {
        const myWishlistData = await Wishlist.find({
          userid: req.token.userid,
        })
          .populate({
            path: "metalid",
            model: Metal,
            populate: {
              path: "productid",
              model: Product,
              select: "p_id category header_name",
            },
            select: "-material_wise -videos -createdAt -updatedAt -__v",
          })
          .select("-userid -createdAt -updatedAt -__v")
          .lean();

        return responseManager.onSuccess("Wishlist list ", myWishlistData, res);
      } catch (error) {
        return responseManager.onError(error, res);
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to list whishlist" },
      res
    );
  }
};

exports.listAllWishlist = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { page, limit } = req.query;

      const p = Number(page) ? Number(page) : 1;
      const l = Number(limit) ? Number(limit) : 10;

      await Wishlist.countDocuments() // Count total number of documents
        .then((totalRecords) => {
          return Wishlist.find()
            .skip((p - 1) * l)
            .limit(l)
            .lean()
            .populate([
              {
                path: "userid",
                model: User,
                select: "first_name last_name email mobile",
              },
              {
                path: "metalid",
                model: Metal,
                select: "m_id sku_name metal",
                populate: {
                  path: "productid",
                  model: Product,
                  select: "p_id category header_name",
                },
              },
            ])
            .select("-material_wise -createdAt -updatedAt -__v")
            .then((data) => {
              return responseManager.onSuccess(
                "Wishlist list ",
                { list: data, total: totalRecords },
                res
              );
            })
            .catch((error) => {
              return responseManager.onError(error, res);
            });
        })
        .catch((error) => {
          return responseManager.onError(error, res);
        });
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to list whishlist" },
      res
    );
  }
};

exports.checkWishlist = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { metalid } = req.body;
      const checkWishlistData = await Wishlist.findOne({
        userid: req.token.userid,
        metalid: metalid,
      });
      if (checkWishlistData == null) {
        return responseManager.onSuccess(
          "Wishlist status",
          { status: false },
          res
        );
      } else {
        return responseManager.onSuccess(
          "Wishlist status",
          { status: true },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to list whishlist" },
      res
    );
  }
};
