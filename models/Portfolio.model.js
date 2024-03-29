const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { isURL, isEmail } = require("validator");

function urlSchemaNotRequired(opts = {}) {
  const { required } = opts;

  return {
    type: String,
    // required: !!required,
    required: false,
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
    required: false,
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
  linkedInURL: urlSchemaNotRequired(),
  gitHubURL: urlSchemaNotRequired(),
  uniqueIdentifier: { type: String},
  interests: [String],
  // To be added later
  // Experience will be a model on its own and will be referenced here.
  // experience: [{position: { type: String }, location: {type: String}, company: { type: String },startDate: { type: Date }, endDate: { type: Date }],
  // certifications: [{
  //   name: { type: String },
  //   issuer: { type: String },
  //   issueDate: { type: Date }
  // }]
  experiences: [{type: Schema.Types.ObjectId, ref: 'Experience'}],
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  educations: [{ type: Schema.Types.ObjectId, ref: 'Education' }],
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job'}]
}, {
  timestamps: true
});

module.exports = model("Portfolio", portfolioSchema);
