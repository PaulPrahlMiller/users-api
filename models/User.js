const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  firstname: {
    type: String,
    trim: true,
    minLength: 2,
    maxLength: 32,
    required: true,
  },
  lastname: {
    type: String,
    minLength: 2,
    maxLength: 32,
    required: true,
  },
  email: {
    type: String,
    maxlength: 255,
    required: true,
  },
});

module.exports = model("User", userSchema);
