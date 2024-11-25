const mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");

const metalSchema = new mongoose.Schema(
  {
    productid: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    m_id: {
      type: String,
      required: false
    },
    sku_name: {
      type: String,
    },
    metal: {
      type: String,
      required: true,
    },
    material_wise: [
      {
        material: {
          type: String,
        },
        diamond_type: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
        },
        special_price: {
          type: Number,
        },
        _id: false,
      },
    ],
    size: {
      type: String,
    },
    photos: [],
  },
  { timestamps: true, strict: false, autoIndex: true }
);

metalSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Metal", metalSchema);
