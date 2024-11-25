const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true, strict: false, autoIndex: true }
);

module.exports = mongoose.model('Coupon', couponSchema);