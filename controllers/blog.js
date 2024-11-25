const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const AddToCart = require("../models/addToCartProduct");
const Wishlist = require("../models/wishlistProduct");
const Product = require("../models/product");
const Metal = require("../models/metal");
const async = require("async");
const { metalIdGenerator } = require("../utilities/helper");
const Blog = require("../models/blog");

exports.addBlog = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified role")
      .lean();
    if (userData && userData.verified == true) {
      const { blogid, title, description, banner, post_by } = req.body;

      if (blogid && blogid != "" && mongoose.Types.ObjectId.isValid(blogid)) {
        const obj = {
          title: title,
          description: description,
          banner: banner,
          post_by: post_by
        };
        await Blog.findByIdAndUpdate(blogid, obj);

        let blogData = await Blog.findById(blogid)
          .select("-createdAt -updatedAt -__v")
          .lean();
        return responseManager.onSuccess("Blog updated", blogData, res);
      } else {
        const obj = {
          title: title,
          description: description,
          banner: banner,
          post_by: post_by
        };  
        const blogData = await Blog.create(obj);

        return responseManager.onSuccess(
          "Blog added successfully",
          blogData,
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to add blog" },
      res
    );
  }
};

exports.listBlog = async (req, res) => {

    Blog.find()
      .select("-createdAt -__v")
      .sort({ _id: -1 })
      .lean()
      .then((blogData) => {
        return responseManager.onSuccess("Blog list", blogData, res);
      })
      .catch((error) => {
        return responseManager.onError(error, res);
      });
};

exports.getOneBlog = async (req, res) => {
    const { blogid } = req.query;
    if (
      blogid &&
      blogid != "" &&
      mongoose.Types.ObjectId.isValid(blogid)
    ) {
      const blogData = await Blog.findById(blogid).select("-createdAt -updatedAt -__v")
        .lean();
      if (blogData && blogData != null) {
        return responseManager.onSuccess("Blog data", blogData, res);
      } else {
        return responseManager.badrequest({ message: "Invalid blog id" }, res);
      }
    } else {
      return responseManager.badrequest({ message: "Invalid blog id" }, res);
    }
};

exports.removeBlog = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { blogid } = req.body;

      if (
        blogid &&
        blogid != "" &&
        mongoose.Types.ObjectId.isValid(blogid)
      ) {
        await Blog.findByIdAndRemove(blogid);
        return responseManager.onSuccess("Blog removed successfully", 1, res);
      } else {
        return responseManager.badrequest(
          { message: "Invalid blog id to remove blog" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to remove blog" },
      res
    );
  }
};
