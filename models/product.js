const mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new mongoose.Schema(
  {
    p_id: {
      type: String,
      required: false,
    },
    p_sku_name: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    header_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    shop_by_style: [],
    shop_by_shape: [],
    top_gift_ideas: [],
    gifts_by_occasion: [],
    metal_wise: [],
    shipping_fee: {
      type: Number,
      required: false,
      default: 0,
    },
    is_igi: {
      type: Boolean,
      required: false,
    },
    is_gia: {
      type: Boolean,
      required: false,
    },
    is_gra: {
      type: Boolean,
      required: false,
    },
    total_rating: {
      type: String,
      required: false,
    },
    reviews: [],
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
    p_status: {
      type: Boolean,
      required: false
    }
  },
  { timestamps: true, strict: false, autoIndex: true }
);

productSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Product", productSchema);
