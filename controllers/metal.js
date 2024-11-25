const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const AddToCart = require("../models/addToCartProduct");
const Wishlist = require("../models/wishlistProduct");
const Product = require("../models/product");
const Metal = require("../models/metal");
const Review = require("../models/productReview");
const async = require("async");
const { metalIdGenerator } = require("../utilities/helper");
const AwsCloud = require("../utilities/aws");

exports.addMetal = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const {
        productid,
        metalid,
        sku_name,
        metal,
        material_wise,
        size,
        thumbnail,
        photos,
        videos,
      } = req.body;

      if (
        productid &&
        productid != "" &&
        mongoose.Types.ObjectId.isValid(productid)
      ) {
        if (
          metalid &&
          metalid != "" &&
          mongoose.Types.ObjectId.isValid(metalid)
        ) {
          const priceCalc = [];

          async.forEachSeries(req.body.material_wise, (info, next_info) => {
            info.discount
              ? (info.special_price =
                  info.price - (info.price * info.discount) / 100)
              : (info.special_price = info.price);
            priceCalc.push(info);
            next_info();
          });

          const obj = {
            productid: productid,
            sku_name: sku_name,
            metal: metal,
            material_wise: material_wise ? priceCalc : [],
            size: size,
            thumbnail: thumbnail,
            photos: photos,
            videos: videos,
          };
          await Metal.findByIdAndUpdate(metalid, obj);

          let metalData = await Metal.findById(metalid)
            .select("-createdAt -updatedAt -__v")
            .lean();
          return responseManager.onSuccess("Metal updated successfully", metalData, res);
        } else {
          const priceCalc = [];

          async.forEachSeries(req.body.material_wise, (info, next_info) => {
            info.discount
              ? (info.special_price =
                  info.price - (info.price * info.discount) / 100)
              : (info.special_price = info.price);
            priceCalc.push(info);
            next_info();
          });

          const mId = await metalIdGenerator();

          const obj = {
            productid: productid,
            m_id: mId,
            sku_name: sku_name,
            metal: metal,
            material_wise: material_wise ? priceCalc : [],
            size: size,
            thumbnail: thumbnail,
            photos: photos,
            videos: videos,
          };
          const metalData = await Metal.create(obj);
          await Product.findByIdAndUpdate(productid, {
            $push: { metal_wise: { metalid: metalData._id } },
          });
          return responseManager.onSuccess(
            "Metal added successfully",
            metalData,
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "Invalid product id" },
          res
        );
      }
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

exports.listMetal = async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { metal, page, limit } = req.query;

      const filter = {};
      const p = Number(page) ? Number(page) : 1;
      const l = Number(limit) ? Number(limit) : 10;
      if (metal) {
        filter.metal = metal;
      }

      await Metal.countDocuments() // Count total number of documents
        .then((totalRecords) => {
          return Metal.find(filter)
            .skip((p - 1) * l)
            .limit(l)
            .populate([
              {
                path: "productid",
                model: Product,
                select: "p_id",
              },
            ])
            .select("m_id metal sku_name thumbnail photos")
            .sort({ _id: -1 })
            .lean()
            .then((metalData) => {
              return responseManager.onSuccess(
                "Metal list",
                { list: metalData, total: totalRecords },
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
      { message: "Invalid token to list metal" },
      res
    );
  }
};

exports.getOneMetal = async (req, res) => {
  const errors = validationResult(req);

  const { productid, metal } = req.query;
  if (errors.isEmpty()) {
    if (
      productid &&
      productid != "" &&
      mongoose.Types.ObjectId.isValid(productid)
    ) {
      const metalData = await Metal.findOne({
        $and: [
          {
            productid: new mongoose.Types.ObjectId(productid),
          },
          {
            metal: metal,
          },
        ],
      })
        .populate(
          {
            path: "productid",
            model: Product,
            populate: [{
              path: "metal_wise",
              populate: {
                path: "metalid",
                model: Metal,
                select: "metal review",
              },
            }, {
              path: "reviews",
              populate: {
                path: "reviewid",
                model: Review,
                match: {
                  "verified": true
                },
                select: "-verified -productid -__v -createdAt",
              },
            },],
            select: "p_id category header_name description shop_by_style shop_by_shape top_gift_ideas gifts_by_occasion shipping_fee is_igi is_gia is_gra reviews total_rating",
          }
        )
        .select("-createdAt -updatedAt -__v")
        .lean();
      if (metalData && metalData != null) {
        return responseManager.onSuccess("Metal data", metalData, res);
      } else {
        return responseManager.badrequest({ message: "No data found" }, res);
      }
    } else {
      return responseManager.badrequest({ message: "Invalid metal id" }, res);
    }
  } else {
    return responseManager.schemaError(errors.array()[0].msg, res);
  }
};

exports.removeMetal = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { productid, metalid } = req.body;

      if (
        metalid &&
        metalid != "" &&
        mongoose.Types.ObjectId.isValid(metalid) &&
        productid &&
        productid != "" &&
        mongoose.Types.ObjectId.isValid(productid)
      ) {
        const deleteData = await Metal.findById(metalid);

        await Product.findByIdAndUpdate(
          productid,
          {
            $pull: {
              metal_wise: { metalid: new mongoose.Types.ObjectId(metalid) },
            },
          },
          { new: true }
        );
        await AddToCart.deleteMany({ metalid: metalid });
        await Wishlist.deleteMany({ metalid: metalid });

        const photoUrl = [];

        async.forEachSeries(deleteData.photos, (info, next_info) => {
          photoUrl.push({ url: info.url });
          next_info();
        });

        async.forEachSeries(deleteData.videos, (info, next_info) => {
          photoUrl.push({ url: info.url });
          next_info();
        });
        async.forEachSeries(photoUrl, (info, next_info) => {
          AwsCloud.deleteFromS3(info.url)
            .then((result) => {
            })
            .catch((error) => {
              return responseManager.onError(error, res);
            });
          next_info();
        });

        await Metal.findByIdAndRemove(metalid);
        return responseManager.onSuccess("Metal removed successfully", 1, res);
      } else {
        return responseManager.badrequest(
          { message: "Invalid product id or metal id to remove metal" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to remove product" },
      res
    );
  }
};

exports.searchAdminMetal = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { search } = req.body;

  await Metal.find({
    $or: [
      { sku_name: { $regex: new RegExp(search, "i") } },
    ],
  })
    .sort({ _id: -1 })
    .select("-createdAt -updatedAt -__v")
    .lean()
    .then((productData) => {
      const totalRecords = productData.length;
      return responseManager.onSuccess(
        "Search Product list",
        { list: productData, total: totalRecords },
        res
      );
    })
    .catch((error) => {
      return responseManager.onError(error, res);
    });
};