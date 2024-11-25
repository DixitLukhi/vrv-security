const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const AddToCart = require("../models/addToCartProduct");
const { User } = require("../models/user");
const Product = require("../models/product");
const Metal = require("../models/metal");
const async = require("async");

exports.AddToCart = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { metalid, quantity, material_wise, size } = req.body;

      if (
        metalid &&
        metalid != "" &&
        mongoose.Types.ObjectId.isValid(metalid)
      ) {
        const existingData = await AddToCart.findOne({
          metalid: metalid,
          userid: req.token.userid,
          // quantity: quantity,
          size: size,
          material_wise: material_wise,
        })
          .select("-createdAt -updatedAt -__v")
          .lean();

        if (existingData == null) {
          const obj = {
            metalid: metalid,
            userid: req.token.userid,
            quantity: quantity,
            size: size,
            material_wise: material_wise,
          };

          await AddToCart.create(obj);
          return responseManager.onSuccess("Product added in cart", 1, res);
        } else {
          await AddToCart.findOneAndUpdate(
            {
              metalid: metalid,
              userid: req.token.userid,
              // quantity: quantity,
              size: size,
              material_wise: material_wise,
            },
            { quantity: quantity + existingData.quantity }
          ).lean();
          return responseManager.onSuccess("Product added in cart", 1, res);
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
      { message: "Invalid token for add to cart" },
      res
    );
  }
};

exports.removeFromCart = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { metalid, quantity, material_wise, size } = req.body;
      console.log(size);
      if (
        metalid &&
        metalid != "" &&
        mongoose.Types.ObjectId.isValid(metalid)
      ) {
        await AddToCart.findOneAndRemove({
          metalid: metalid,
              userid: req.token.userid,
              quantity: quantity,
              size: size,
              material_wise: material_wise,
        });
        return responseManager.onSuccess(
          "Product removed from cart successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          { message: "Invalid metal id to remove product" },
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

exports.listCart = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      try {

        const myCartData = await AddToCart.find({
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
        
        myCartData.map((prod) => {
          prod.metalid.photos = [prod.metalid.photos[0]];
        });

        return responseManager.onSuccess("Wishlist list ", myCartData, res);
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

exports.listAllCart = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { page, limit } = req.query;

      const p = Number(page) ? Number(page) : 1;
      const l = Number(limit) ? Number(limit) : 10;

      await AddToCart.countDocuments() // Count total number of documents
        .then((totalRecords) => {
          return AddToCart.find()
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
                "Cart list ",
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
      { message: "Invalid token to list cart" },
      res
    );
  }
};
