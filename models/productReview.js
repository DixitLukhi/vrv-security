const mongoose = require("mongoose");

const productReviewSchema = new mongoose.Schema(
  {
    productid: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    review: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      required: false,
    },
    meta: {
      meta_title: {
        type: String,
        required: false,
      },
      meta_description: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true, strict: false, autoIndex: true }
);

module.exports = mongoose.model("Review", productReviewSchema);
