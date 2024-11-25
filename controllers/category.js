const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const {
  Category,
  ShopByStyle,
  ShopByShape,
  TopGiftIdeas,
  GiftsByOccassion,
} = require("../models/category");

exports.addCategory = async (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
      const userData = await User.findById(req.token.userid)
        .select("verified role")
        .lean();
      if (userData && userData.verified == true) {
        const {
          categoryid,
          name,
          shop_by_style,
          shop_by_shape,
          top_gift_ideas,
          gifts_by_occasion,
          photo
        } = req.body;

        if (
          categoryid &&
          categoryid != "" &&
          mongoose.Types.ObjectId.isValid(categoryid)
        ) {
          const obj = {
            name: name,
            shop_by_style: shop_by_style,
            shop_by_shape: shop_by_shape,
            top_gift_ideas: top_gift_ideas,
            gifts_by_occasion: gifts_by_occasion,
            photo: photo
          };
          await Category.findByIdAndUpdate(categoryid, obj);

          let categoryData = await Category.findById(categoryid)
            .select("-createdAt -updatedAt -__v")
            .lean();
          return responseManager.onSuccess(
            "Category updated",
            categoryData,
            res
          );
        } else {
          const obj = {
            name: name,
            shop_by_style: shop_by_style,
            shop_by_shape: shop_by_shape,
            top_gift_ideas: top_gift_ideas,
            gifts_by_occasion: gifts_by_occasion,
            photo:photo
          };
          const categoryData = await Category.create(obj);
          return responseManager.onSuccess(
            "Category created successfully!",
            categoryData,
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

exports.listCategory = async (req, res) => {
  Category.find()
    .select("name photo")
    .lean()
    .then((categoryData) => {
      return responseManager.onSuccess("Category list", categoryData, res);
    })
    .catch((error) => {
      return responseManager.onError(error, res);
    });
};

exports.getOneCategory = async (req, res) => {
  const { category } = req.query;

  Category.find({
    name: category,
  })
    .populate([
      {
        path: "shop_by_style",
        populate: {
          path: "category",
          model: ShopByStyle,
          select: "name photo",
        },
      },
      {
        path: "shop_by_shape",
        populate: {
          path: "category",
          model: ShopByShape,
          select: "name photo",
        },
      },
      {
        path: "top_gift_ideas",
        populate: {
          path: "category",
          model: TopGiftIdeas,
          select: "name photo",
        },
      },
      {
        path: "gifts_by_occasion",
        populate: {
          path: "category",
          model: GiftsByOccassion,
          select: "name photo",
        },
      },
    ])
    .select("-createdAt -updatedAt -__v")
    .lean()
    .then((categoryData) => {
      return responseManager.onSuccess("Category data", categoryData, res);
    })
    .catch((error) => {
      return responseManager.onError(error, res);
    });
};

exports.removeCategory = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { categoryid } = req.body;

      if (
        categoryid &&
        categoryid != "" &&
        mongoose.Types.ObjectId.isValid(categoryid)
      ) {
        await Category.findByIdAndRemove(categoryid);
        return responseManager.onSuccess(
          "Category removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          { message: "Invalid category id to remove product" },
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
 
exports.addShobByStyleCategory = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { shopbystyleid, categoryid, name, photo } = req.body;

      if (
        categoryid &&
        categoryid != "" &&
        mongoose.Types.ObjectId.isValid(categoryid)
      ) {
        if (
          shopbystyleid &&
          shopbystyleid != "" &&
          mongoose.Types.ObjectId.isValid(shopbystyleid)
        ) {
          const obj = {
            categoryid: categoryid,
            name: name,
            photo: photo,
          };
          await ShopByStyle.findByIdAndUpdate(shopbystyleid, obj);

          let shopByStyleData = await ShopByStyle.findById(shopbystyleid)
            .select("-createdAt -updatedAt -__v")
            .lean();
          return responseManager.onSuccess(
            "Sub category updated",
            shopByStyleData,
            res
          );
        } else {
          const obj = {
            categoryid: categoryid,
            name: name,
            photo: photo,
          };
          const shopByStyleData = await ShopByStyle.create(obj);
          await Category.findByIdAndUpdate(categoryid, {
            $push: { shop_by_style: { category: shopByStyleData._id } },
          });
          return responseManager.onSuccess(
            "Sub category added successfully",
            shopByStyleData,
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "Invalid category id" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to add category" },
      res
    );
  }
};

exports.addShobByShapeCategory = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { shopbyshapeid, categoryid, name, photo } = req.body;

      if (
        categoryid &&
        categoryid != "" &&
        mongoose.Types.ObjectId.isValid(categoryid)
      ) {
        if (
          shopbyshapeid &&
          shopbyshapeid != "" &&
          mongoose.Types.ObjectId.isValid(shopbyshapeid)
        ) {
          const obj = {
            categoryid: categoryid,
            name: name,
            photo: photo,
          };
          await ShopByShape.findByIdAndUpdate(shopbyshapeid, obj);

          let shopByShapeData = await ShopByShape.findById(shopbyshapeid)
            .select("-createdAt -updatedAt -__v")
            .lean();
          return responseManager.onSuccess(
            "Sub category updated",
            shopByShapeData,
            res
          );
        } else {
          const obj = {
            categoryid: categoryid,
            name: name,
            photo: photo,
          };
          const shopByShapeData = await ShopByShape.create(obj);
          await Category.findByIdAndUpdate(categoryid, {
            $push: { shop_by_shape: { category: shopByShapeData._id } },
          });
          return responseManager.onSuccess(
            "Sub category added successfully",
            shopByShapeData,
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "Invalid category id" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to add category" },
      res
    );
  }
};

exports.addTopGiftIdeasCategory = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { topgiftideasid, categoryid, name, photo } = req.body;

      if (
        categoryid &&
        categoryid != "" &&
        mongoose.Types.ObjectId.isValid(categoryid)
      ) {
        if (
          topgiftideasid &&
          topgiftideasid != "" &&
          mongoose.Types.ObjectId.isValid(topgiftideasid)
        ) {
          const obj = {
            categoryid: categoryid,
            name: name,
            photo: photo,
          };
          await TopGiftIdeas.findByIdAndUpdate(topgiftideasid, obj);

          let topGiftIdeasData = await TopGiftIdeas.findById(topgiftideasid)
            .select("-createdAt -updatedAt -__v")
            .lean();
          return responseManager.onSuccess(
            "Sub category updated",
            topGiftIdeasData,
            res
          );
        } else {
          const obj = {
            categoryid: categoryid,
            name: name,
            photo: photo,
          };
          const topGiftIdeasData = await TopGiftIdeas.create(obj);
          await Category.findByIdAndUpdate(categoryid, {
            $push: { top_gift_ideas: { category: topGiftIdeasData._id } },
          });
          return responseManager.onSuccess(
            "Sub category added successfully",
            topGiftIdeasData,
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "Invalid category id" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to add category" },
      res
    );
  }
};

exports.addGiftsByOccasionCategory = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { giftsbyoccasionid, categoryid, name, photo } = req.body;

      if (
        categoryid &&
        categoryid != "" &&
        mongoose.Types.ObjectId.isValid(categoryid)
      ) {
        if (
          giftsbyoccasionid &&
          giftsbyoccasionid != "" &&
          mongoose.Types.ObjectId.isValid(giftsbyoccasionid)
        ) {
          const obj = {
            categoryid: categoryid,
            name: name,
            photo: photo,
          };
          await GiftsByOccassion.findByIdAndUpdate(giftsbyoccasionid, obj);

          let giftsByOccasionData = await GiftsByOccassion.findById(
            giftsbyoccasionid
          )
            .select("-createdAt -updatedAt -__v")
            .lean();
          return responseManager.onSuccess(
            "Sub category updated",
            giftsByOccasionData,
            res
          );
        } else {
          const obj = {
            categoryid: categoryid,
            name: name,
            photo: photo,
          };
          const giftsByOccasionData = await GiftsByOccassion.create(obj);
          await Category.findByIdAndUpdate(categoryid, {
            $push: { gifts_by_occasion: { category: giftsByOccasionData._id } },
          });
          return responseManager.onSuccess(
            "Sub category added successfully",
            giftsByOccasionData,
            res
          );
        }
      } else {
        return responseManager.badrequest(
          { message: "Invalid category id" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to add category" },
      res
    );
  }
};

exports.removeShopByStyleCategory = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { categoryid, shopbystyleid } = req.body;

      if (
        shopbystyleid &&
        shopbystyleid != "" &&
        mongoose.Types.ObjectId.isValid(shopbystyleid) &&
        categoryid &&
        categoryid != "" &&
        mongoose.Types.ObjectId.isValid(categoryid)
      ) {
        const da = await Category.findByIdAndUpdate(
          categoryid,
          {
            $pull: {
              shop_by_style: {
                category: new mongoose.Types.ObjectId(shopbystyleid),
              },
            },
          },
          { new: true }
        );
        await ShopByStyle.findByIdAndRemove(shopbystyleid);
        return responseManager.onSuccess(
          "Sub category removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          {
            message:
              "Invalid category id or sub category id to remove sub category",
          },
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

exports.removeShopByShapeCategory = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { categoryid, shopbyshapeid } = req.body;

      if (
        shopbyshapeid &&
        shopbyshapeid != "" &&
        mongoose.Types.ObjectId.isValid(shopbyshapeid) &&
        categoryid &&
        categoryid != "" &&
        mongoose.Types.ObjectId.isValid(categoryid)
      ) {
        const da = await Category.findByIdAndUpdate(
          categoryid,
          {
            $pull: {
              shop_by_shape: {
                category: new mongoose.Types.ObjectId(shopbyshapeid),
              },
            },
          },
          { new: true }
        );
        await ShopByShape.findByIdAndRemove(shopbyshapeid);
        return responseManager.onSuccess(
          "Sub category removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          {
            message:
              "Invalid category id or sub category id to remove sub category",
          },
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

exports.removeTopGiftIdeasCategory = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { categoryid, topgiftideasid } = req.body;

      if (
        topgiftideasid &&
        topgiftideasid != "" &&
        mongoose.Types.ObjectId.isValid(topgiftideasid) &&
        categoryid &&
        categoryid != "" &&
        mongoose.Types.ObjectId.isValid(categoryid)
      ) {
        const da = await Category.findByIdAndUpdate(
          categoryid,
          {
            $pull: {
              top_gift_ideas: {
                category: new mongoose.Types.ObjectId(topgiftideasid),
              },
            },
          },
          { new: true }
        );
        await TopGiftIdeas.findByIdAndRemove(topgiftideasid);
        return responseManager.onSuccess(
          "Sub category removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          {
            message:
              "Invalid category id or sub category id to remove sub category",
          },
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

exports.removeGiftsByOccasionCategory = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { categoryid, giftsbyoccasionid } = req.body;

      if (
        giftsbyoccasionid &&
        giftsbyoccasionid != "" &&
        mongoose.Types.ObjectId.isValid(giftsbyoccasionid) &&
        categoryid &&
        categoryid != "" &&
        mongoose.Types.ObjectId.isValid(categoryid)
      ) {
        const da = await Category.findByIdAndUpdate(
          categoryid,
          {
            $pull: {
              gifts_by_occasion: {
                icategoryd: new mongoose.Types.ObjectId(giftsbyoccasionid),
              },
            },
          },
          { new: true }
        );
        await GiftsByOccassion.findByIdAndRemove(giftsbyoccasionid);
        return responseManager.onSuccess(
          "Sub category removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          {
            message:
              "Invalid category id or sub category id to remove sub category",
          },
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
