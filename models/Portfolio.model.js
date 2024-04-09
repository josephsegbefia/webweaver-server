const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { isURL, isEmail } = require("validator");

const urlSchemaNotRequired = {
  type: String,
  validate: {
    validator: function(value) {
      // Check if the value is a valid URL using the validator library
      return !value || isURL(value);
    },
    message: props => `${props.value} is not a valid URL`
  }
};

function emailSchema() {
  return {
    type: String,
    validate: {
      validator: isEmail,
      message: (props) => `${props.value} is not a valid email address`
    }
  };
}

const portfolioSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User'},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  bio: { type: String },
  headLine: { type: String },
  email: emailSchema(),
  phone: { type: String },
  location: { type: String },
  avatarURL: { type: String },
  skills: [String],
  languages: [String],
  linkedInURL: urlSchemaNotRequired,
  gitHubURL: urlSchemaNotRequired,
  uniqueIdentifier: { type: String},
  interests: [String],
  experiences: [{ type: Schema.Types.ObjectId, ref: 'Experience' }],
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  educations: [{ type: Schema.Types.ObjectId, ref: 'Education' }],
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }]
}, {
  timestamps: true
});

module.exports = model("Portfolio", portfolioSchema);
