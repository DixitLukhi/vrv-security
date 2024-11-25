const mongoose = require("mongoose");

const categoryCatalogueSchema = new mongoose.Schema(
  {
    rule: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    start_time: {
        type: Date,
        required: true
    }, 
    end_time: {
        type: Date,
        required: true
    },
    discount: {
        type: Number,
        required: false
    },
    amount: {
        type: Number,
        required: false
    },
    change: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    restriction: []
  },
  { timestamps: true, strict: false, autoIndex: true }
);

module.exports = mongoose.model('CategoryCatalogue', categoryCatalogueSchema);