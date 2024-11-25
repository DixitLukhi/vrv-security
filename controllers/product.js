const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const Product = require("../models/product");
const async = require("async");
const Metal = require("../models/metal");
const Review = require("../models/productReview");
const { idGenerator, productIdGenerator } = require("../utilities/helper");

exports.addProduct = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid).select("verified role").lean();

    if (userData && userData.verified == true) {
      const {
        productid,
        p_sku_name,
        category,
        header_name,
        description,
        shop_by_style,
        shop_by_shape,
        top_gift_ideas,
        gifts_by_occasion,
        shipping_fee,
        is_igi,
        is_gia,
        is_gra,
        meta,
      } = req.body;
      if (
        productid &&
        productid != "" &&
        mongoose.Types.ObjectId.isValid(productid)
        ) {
          const obj = {
          category: category ? category.name : "",
          p_sku_name: p_sku_name,
          header_name: header_name,
          description: description,
          shop_by_style: shop_by_style,
          shop_by_shape: shop_by_shape,
          top_gift_ideas: top_gift_ideas,
          gifts_by_occasion: gifts_by_occasion,
          shipping_fee: shipping_fee,
          // more_info: req.body.more_info ? moreInfo : [],
          is_igi: is_igi,
          is_gia: is_gia,
          is_gra: is_gra,
          meta: meta ? meta : {},
        };
        await Product.findByIdAndUpdate(productid, obj);

        let productData = await Product.findById(productid)
          .select("-createdAt -updatedAt -__v")
          .lean();
        return responseManager.onSuccess("Product updated", productData, res);
      } else {

        const pId = await productIdGenerator();
        const obj = {
          p_id: pId,
          category: category ? category.name : "",
          p_sku_name: p_sku_name,
          header_name: header_name,
          description: description,
          shop_by_style: shop_by_style,
          shop_by_shape: shop_by_shape,
          top_gift_ideas: top_gift_ideas,
          gifts_by_occasion: gifts_by_occasion,
          shipping_fee: shipping_fee,
          // more_info: req.body.more_info ? moreInfo : [],
          is_igi: is_igi,
          is_gia: is_gia,
          is_gra: is_gra,
          meta: meta,
          p_status: false,
        };
        const productData = await Product.create(obj);
        return responseManager.onSuccess(
          "Product created successfully!",
          productData,
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

exports.listProduct = async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const {
    category,
    shop_by_style,
    shop_by_shape,
    top_gift_ideas,
    gifts_by_occasion,
    page,
    limit,
  } = req.query;
  const filter = {};
  const p = Number(page) ? Number(page) : 1;
  const l = Number(limit) ? Number(limit) : 10;

  if (category) {
    filter.category = category;
  }

  const orConditions = [];

  if (shop_by_style) {
    orConditions.push({ "shop_by_style.name": shop_by_style });
  }

  if (shop_by_shape) {
    orConditions.push({ "shop_by_shape.name": shop_by_shape });
  }

  if (top_gift_ideas) {
    orConditions.push({ "top_gift_ideas.name": top_gift_ideas });
  }

  if (gifts_by_occasion) {
    orConditions.push({ "gifts_by_occasion.name": gifts_by_occasion });
  }

  if (orConditions.length > 0) {
    filter.$or = orConditions;
  }

  Product.countDocuments(filter) // Count total number of documents
    .then((totalRecords) => {

      return Product.find(filter)
        .sort({ _id: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .select("p_id p_sku_name header_name p_status meta")
        .lean()
        .then((productData) => {

          return responseManager.onSuccess(
            "Product list",
            { list: productData, total: totalRecords },
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
};

exports.listUserSideProduct = async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const {
      category,
      shop_by_style,
      shop_by_shape,
      top_gift_ideas,
      gifts_by_occasion,
      gmetal,
      page,
      limit,
    } = req.query;
    const filter = {
      p_status: true,
    };
    const p = Number(page) ? Number(page) : 1;
    const l = Number(limit) ? Number(limit) : 12;
    const p_status = true;
    if (category) {
      filter.category = category;
    }

    const orConditions = [];

    if (shop_by_style) {
      orConditions.push({ "shop_by_style.name": shop_by_style });
    }

    if (shop_by_shape) {
      orConditions.push({ "shop_by_shape.name": shop_by_shape });
    }

    if (top_gift_ideas) {
      orConditions.push({ "top_gift_ideas.name": top_gift_ideas });
    }

    if (gifts_by_occasion) {
      orConditions.push({ "gifts_by_occasion.name": gifts_by_occasion });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    const totalRecords = await Product.countDocuments(filter);

    const productData = await Product.find(filter)
      .sort({ _id: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .populate([
        {
          path: "metal_wise",
          populate: {
            path: "metalid",
            model: Metal,
            match: { metal: gmetal },
            select: "m_id metal photos material_wise thumbnail",
          },
        },
      ])
      .select("p_id header_name metal_wise category total_rating")
      .lean();
    productData.map((prod) => {
      prod.metal_wise.sort((a, b) => {
        if (a.metalid !== null && b.metalid === null) {
          return -1; // `a` comes before `b`
        } else if (a.metalid === null && b.metalid !== null) {
          return 1; // `b` comes before `a`
        }
        return 0; // No change in order
      });
    });
    
    for (let index = 0; index < productData.length; index++) {
      productData[index].metal_wise[0].metalid.material_wise =
      productData[index].metal_wise[0].metalid.material_wise[0];
      productData[index].metal_wise[0].metalid.photos =
      productData[index].metal_wise[0].metalid.photos[0];
    }

    return responseManager.onSuccess(
      "Product list",
      { list: productData, total: totalRecords },
      res
    );
  } catch (error) {
    return responseManager.onError(error, res);
  }
};

exports.getOneProduct = async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { productid } = req.query;
  if (
    productid &&
    productid != "" &&
    mongoose.Types.ObjectId.isValid(productid)
  ) {
    const productData = await Product.findById(productid)
      .populate([
        {
          path: "metal_wise",
          populate: {
            path: "metalid",
            model: Metal,
            select: "-productid -createdAt -updatedAt -__v",
          },
        },
        {
          path: "reviews",
          populate: {
            path: "reviewid",
            model: Review,
            select: "-productid -createdAt -updatedAt -__v",
          },
        },
      ])
      .select("-createdAt -updatedAt -__v")
      .lean();
    if (productData && productData != null) {
      return responseManager.onSuccess("Product data", productData, res);
    } else {
      return responseManager.badrequest({ message: "Invalid product id" }, res);
    }
  } else {
    return responseManager.badrequest({ message: "Invalid product id" }, res);
  }
};

exports.removeProduct = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { productid } = req.body;

      if (
        productid &&
        productid != "" &&
        mongoose.Types.ObjectId.isValid(productid)
      ) {
        await Metal.deleteMany({ productid: productid });
        await Product.findByIdAndRemove(productid);
        return responseManager.onSuccess(
          "Product removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          { message: "Invalid product id to remove product" },
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

exports.searchProduct = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { search } = req.body;

  await Product.find({
    $or: [
      { header_name: { $regex: new RegExp(search, "i") } },
      { category: { $regex: new RegExp(search, "i") } },
      { productid: { $regex: new RegExp(search, "i") } },
      { "shop_by_style.name": { $regex: new RegExp(search, "i") } },
      { "shop_by_shape.name": { $regex: new RegExp(search, "i") } },
      { "top_gift_ideas.name": { $regex: new RegExp(search, "i") } },
      { "gifts_by_occasion.name": { $regex: new RegExp(search, "i") } },
      { p_sku_name: { $regex: new RegExp(search, "i") } },
    ],
  })
    .sort({ _id: -1 })
    .populate([
      {
        path: "metal_wise",
        populate: {
          path: "metalid",
          model: Metal,
          // limit:1,
          // match: { metal: "Sterling Silver" },
          select: "-productid -createdAt -updatedAt -__v",
        },
      },
    ])
    .select("-createdAt -updatedAt -__v")
    .lean()
    .then((productData) => {
      let filteredProducts = [];

      for (const prod of productData) {
        if (prod.metal_wise.length > 0) {
          filteredProducts.push(prod);
        }
      }
      const totalRecords = filteredProducts.length;

      return responseManager.onSuccess(
        "Search Product list",
        { list: filteredProducts, total: totalRecords },
        res
      );
    })
    .catch((error) => {
      return responseManager.onError(error, res);
    });
};

exports.searchAdminProduct = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { search } = req.body;

  await Product.find({
    $or: [
      { header_name: { $regex: new RegExp(search, "i") } },
      { category: { $regex: new RegExp(search, "i") } },
      { "shop_by_style.name": { $regex: new RegExp(search, "i") } },
      { "shop_by_shape.name": { $regex: new RegExp(search, "i") } },
      { "top_gift_ideas.name": { $regex: new RegExp(search, "i") } },
      { "gifts_by_occasion.name": { $regex: new RegExp(search, "i") } },
      { p_sku_name: { $regex: new RegExp(search, "i") } },
    ],
  })
    .sort({ _id: -1 })
    .populate([
      {
        path: "metal_wise",
        populate: {
          path: "metalid",
          model: Metal,
          // limit:1,
          // match: { metal: "Sterling Silver" },
          select: "-productid -createdAt -updatedAt -__v",
        },
      },
    ])
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

exports.searchAdminMetal = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { search } = req.body;

  await Product.find({
    $or: [
      { header_name: { $regex: new RegExp(search, "i") } },
      { category: { $regex: new RegExp(search, "i") } },
      { "shop_by_style.name": { $regex: new RegExp(search, "i") } },
      { "shop_by_shape.name": { $regex: new RegExp(search, "i") } },
      { "top_gift_ideas.name": { $regex: new RegExp(search, "i") } },
      { "gifts_by_occasion.name": { $regex: new RegExp(search, "i") } },
      { p_sku_name: { $regex: new RegExp(search, "i") } },
    ],
  })
    .sort({ _id: -1 })
    .populate([
      {
        path: "metal_wise",
        populate: {
          path: "metalid",
          model: Metal,
          // limit:1,
          // match: { metal: "Sterling Silver" },
          select: "-productid -createdAt -updatedAt -__v",
        },
      },
    ])
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

exports.changeProductStatus = async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { productid } = req.body;

  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const productData = await Product.findById(productid)
        .select("p_status metal_wise")
        .populate([
          {
            path: "metal_wise",
            populate: {
              path: "metalid",
              model: Metal,
              select: "metal",
            },
          },
        ])
        .lean();
      if(productData.metal_wise.length == 5) {
        const metals = productData.metal_wise.map((metal) => metal.metalid.metal);
        const expectedMetals = [
          "Sterling Silver",
          "Rose Gold",
          "White Gold",
          "Yellow Gold",
          "Platinum",
        ];
  
        const containsExpectedMetals = expectedMetals.every((metal) =>
        metals.includes(metal)
      );
  
      if (containsExpectedMetals && metals.length === expectedMetals.length) {
        // Update the product status
        await Product.findByIdAndUpdate(productid, {
          p_status: !productData.p_status,
        });
  
        return responseManager.onSuccess("Product status changed", 1, res);
      } else {
        return responseManager.onSuccess("Metals are not as expected", 1, res);
      }

      }  else {
        return responseManager.onSuccess("Metals are not as expected", 1, res);
      } 
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

exports.changeInAllProduct = async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const productData = await Metal.find().lean();

      for (let index = 0; index < productData.length; index++) {
        await Metal.findByIdAndUpdate(productData[index]._id, {photos: [], videos: [], thumbnail: []});
      
      }
      return responseManager.onSuccess("Change is done", 1, res);
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
