const mongoose = require('mongoose');
const enquirySchema = new mongoose.Schema({
	productid: {
    type: String,
  },
  product_name: {
    type: String,
  }, 
  name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
    },
    message: {
        type: String,
    },
    design: {},
    taken: {
      type: Boolean,
      required: true
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
});

module.exports = mongoose.model('Enquiry', enquirySchema);
