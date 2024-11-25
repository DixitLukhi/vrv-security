const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    metalid: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    userid: {
      type: mongoose.Types.ObjectId,
      required: true,
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

module.exports = mongoose.model("Wishlist", wishlistSchema);
