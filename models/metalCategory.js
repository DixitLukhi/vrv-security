const mongoose = require("mongoose");

const metalCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    material: [],
    diamond_type: [],
  },
  { timestamps: true, strict: false, autoIndex: true }
);

const metalMaterialSchema = new mongoose.Schema(
  {
    metalcategoryid: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, strict: false, autoIndex: true }
);

const metalDiamondTypeSchema = new mongoose.Schema(
  {
    metalcategoryid: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, strict: false, autoIndex: true }
);

const MetalCategory = mongoose.model("MetalCategory", metalCategorySchema);
const MetalMaterial = mongoose.model("MetalMaterial", metalMaterialSchema);
const MetalDiamondType = mongoose.model(
  "MetalDiamondType",
  metalDiamondTypeSchema
);

module.exports = {
  MetalCategory,
  MetalMaterial,
  MetalDiamondType,
};
