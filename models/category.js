const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    shop_by_style: [],
    shop_by_shape: [],
    top_gift_ideas: [],
    gifts_by_occasion: [],
    photo: {}
  },
  { timestamps: true, strict: false, autoIndex: true }
);

const shopByStyleSchema = new mongoose.Schema(
  {
    categoryid: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    photo: {}
  },
  { timestamps: true, strict: false, autoIndex: true }
);

const shopByShapeSchema = new mongoose.Schema(
  {
    categoryid: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    photo: {}
  },
  { timestamps: true, strict: false, autoIndex: true }
);

const topGiftIdeasSchema = new mongoose.Schema(
  {
    categoryid: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    photo: {}
  },
  { timestamps: true, strict: false, autoIndex: true }
);

const giftsByOccassionSchema = new mongoose.Schema(
  {
    categoryid: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    photo: {}
  },
  { timestamps: true, strict: false, autoIndex: true }
);

const subCategorySchema = new mongoose.Schema(
  {
    shop_by_style: [],
    shop_by_shape: [],
    top_gift_ideas: [],
    gifts_by_occasion: [],
  },
  { timestamps: true, strict: false, autoIndex: true }
);

const Category = mongoose.model("Category", categorySchema);
const ShopByStyle = mongoose.model("ShopByStyle", shopByStyleSchema);
const ShopByShape = mongoose.model("ShopByShape", shopByShapeSchema);
const TopGiftIdeas = mongoose.model("TopGiftIdeas", topGiftIdeasSchema);
const GiftsByOccassion = mongoose.model(
  "GiftsByOccassion",
  giftsByOccassionSchema
);
const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = {
  Category,
  ShopByShape,
  ShopByStyle,
  TopGiftIdeas,
  GiftsByOccassion,
  SubCategory,
};
