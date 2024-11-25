var mongoose = require("mongoose");

var otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
    index: { expires: 120 },
    
},
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 120 },
  },
});

module.exports = mongoose.model("Otp", otpSchema);
