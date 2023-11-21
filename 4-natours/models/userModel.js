const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true,
      maxlength: [20, 'A tour name must have less or equal then 20 characters'],
      minlength: [2, 'A tour name must have more or equal then 2 characters'],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowecare: true,
      required: [true, 'a user must have an email associated with the account'],
      validate: [validator.isEmail, 'Please provide a valid email!'],
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'a password must be provided'],
      minlength: 8,
    },
    passwordConfirm: {
      type: String,
      trim: true,
      required: [true, 'a password must be confirmed'],
    },

    photo: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
