const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    post_by: {
      type: String
    },
    description: {
      type: String,
    },
    banner: [],
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

module.exports = mongoose.model('Blog', blogSchema);