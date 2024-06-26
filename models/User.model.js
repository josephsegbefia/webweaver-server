const { Schema, model } = require("mongoose");
const { isEmail, isURL } = require("validator");

function emailSchema(opts = {}) {
  const { required } = opts;
  return {
    type: String,
    required: !!required,
    validate: {
      validator: isEmail,
      message: (props) => `${props.value} is not a valid email address`
    }
  };
}

function urlSchema(opts = {}) {
  const { required } = opts;
  return {
    type: String,
    required: !!required,
    validate: {
      validator: isURL,
      message: (props) => `${props.value} is not a valid URL`
    }
  };
}

const userSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: emailSchema(),
  password: { type: String, required: true },
  emailToken: { type: String },
  passwordResetToken: { type: String },
  // Try this
  uniqueIdentifier: {type: String, default: null },
  isVerified: { type: Boolean, default: false },
  isAdmin: {type: Boolean, default: false},
  portfolio: { type: Schema.Types.ObjectId, ref: 'Portfolio' }
});

const User = model("User", userSchema);

module.exports = User;
