const mongoose = require("mongoose");
const Review = require("../models/productReview");
const Product = require("../models/product");
const responseManager = require("../utilities/responseManager");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");

exports.addReview = async (req, res) => {

  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid).select("profile_pic verified").lean();

    if (userData && userData.verified == true) {
      const { productid, name, title, review, rating, photo, verified } = req.body;

      const errors = validationResult(req);
      
      if (errors.isEmpty()) {
        if (productid && productid != "" && mongoose.Types.ObjectId.isValid(productid)) {
          const obj = {
            productid: productid,
            name: name,
            profile: userData.profile_pic && userData.profile_pic != "" ? userData.profile_pic : "",
            title: title ? title : "",
            review: review ? review : "",
            rating: rating,
            photo: photo ? photo : [],
            verified: verified,
          };
          const reviewData = await Review.create(obj);
          await Product.findByIdAndUpdate(productid,
            {$push: {reviews: {reviewid: reviewData._id}}}
          );
          const productData = await Product.findById(productid).populate([
            {
            path: "reviews",
              populate: {
                path: "reviewid",
                model: Review,
              },
            }
          ]).select("reviews").lean();

          let rating_sum = 0;
          let rating_length = 0;
          if (productData && productData.reviews && productData.reviews.length > 0) {
            productData.reviews.forEach(prod => {
              if (prod.reviewid.verified) {
                rating_length++;
                rating_sum += prod.reviewid.rating;
              }
            });
            rating_sum = (rating_sum/rating_length).toFixed(1);
          }
          
          await Product.findByIdAndUpdate(
            productid,
            {total_rating: rating_sum}
          );
          return responseManager.onSuccess(
            "Review given successfully",
            1,
            res
          );
        } else {
          return responseManager.badrequest(
            { message: "Invalid product to give review" },
            res
          );
        }
      } else {
        return responseManager.schemaError(errors.array()[0].msg, res);
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest({ message: "Invalid token to give review" }, res);
  }
};

exports.listReview = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();
    const { page, limit } = req.query;
    const p = Number(page) ? Number(page) : 1;
    const l = Number(limit) ? Number(limit) : 10;

    if (userData && userData.verified == true) {
      Review.countDocuments()
        .then((totalRecords) => {
          return (
            Review.find()
              .sort({ _id: -1 })
              .skip((p - 1) * l)
              .limit(l)
              .populate([
                {
                  path: "productid",
                  model: Product,
                  select: "p_id category header_name",
                },
              ])
              .select("-createdAt -updatedAt -__v")
              .lean()
              .then((reviewList) => {
                return responseManager.onSuccess(
                  "Review list",
                  { list: reviewList, total: totalRecords },
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
      { message: "Invalid token to get review list" },
      res
    );
  }
};

exports.removeReview = async (req, res) => {
  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    const userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      const { productid, reviewid } = req.body;

      if (
        reviewid &&
        reviewid != "" &&
        mongoose.Types.ObjectId.isValid(reviewid) &&
        productid &&
        productid != "" &&
        mongoose.Types.ObjectId.isValid(productid)
      ) {
        await Product.findByIdAndUpdate(
          productid,
          {
            $pull: {
              reviews: {
                reviewid: new mongoose.Types.ObjectId(reviewid),
              },
            },
          },
          { new: true }
        );
        await Review.findByIdAndRemove(reviewid);
        return responseManager.onSuccess(
          "Review removed successfully",
          1,
          res
        );
      } else {
        return responseManager.badrequest(
          { message: "Invalid reviewid id or productid to remove review" },
          res
        );
      }
    } else {
      return responseManager.badrequest({ message: "User not verified" }, res);
    }
  } else {
    return responseManager.badrequest(
      { message: "Invalid token to remove reviewid" },
      res
    );
  }
};
 
exports.unverifyReview = async (req, res) => {
  const { userid, reviewid } = req.body;

  if (req.token.userid && mongoose.Types.ObjectId.isValid(req.token.userid)) {
    let userData = await User.findById(req.token.userid)
      .select("verified")
      .lean();

    if (userData && userData.verified == true) {
      let reviewData = await Review.findById(reviewid)
        .select("verified productid")
        .lean();

      await Review.findByIdAndUpdate(reviewid, {
        verified: !reviewData.verified,
      });

      const productData = await Product.findById(reviewData.productid).populate([
        {
        path: "reviews",
          populate: {
            path: "reviewid",
            model: Review,
          },
        }
      ]).select("reviews").lean();
      
      let rating_sum = 0;
      let rating_length = 0;
      if (productData && productData.reviews && productData.reviews.length > 0) {
        productData.reviews.forEach(prod => {
          if (prod.reviewid.verified) {
            rating_length++;
            rating_sum += prod.reviewid.rating;
          }
        });
        rating_sum = (rating_sum/rating_length).toFixed(1);
      };
      
      await Product.findByIdAndUpdate(
        reviewData.productid,
        {total_rating: rating_sum}
        );
      return responseManager.onSuccess("Review status updated", 1, res);
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
