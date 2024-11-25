const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const addressSchema = new mongoose.Schema(
  {},
  { timestamps: false, strict: false, autoIndex: true }
);

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    profile_pic: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    role: {
      type: Number,
      default: 0,
    },
    purchases: [],
    address: [addressSchema],
    otp: {
      type: String,
      required: false,
      index: { expires: 120 },
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
  },
  { timestamps: true, strict: false, autoIndex: true }
);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const Address = mongoose.model("Address", addressSchema);
const User = mongoose.model("User", userSchema);

module.exports = { User, Address };
