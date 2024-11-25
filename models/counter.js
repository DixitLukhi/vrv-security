const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  metal: {
    type: Number,
  },
  product: {
    type: Number,
  },
}, {strict: false});

module.exports = mongoose.model("Counter", counterSchema);
