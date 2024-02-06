const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { isURL, isEmail } = require("validator");

function urlSchema(opts = {}) {
  const { required } = opts;

  return {
    type: String,
    required: !!required,
    validate: {
      validator: isURL,
      message: (props) => `$(props.value) is not a valid URL`
    }
  };
}

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

const profileSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  headLine: { type: String, required: true },
  email: emailSchema(),
  phone: { type: String, required: true },
  avatarURL: urlSchema(),
  skills: [String],
  linkedInURL: urlSchema(),
  gitHubURL: urlSchema()
});

module.exports = model("Profile", profileSchema);
