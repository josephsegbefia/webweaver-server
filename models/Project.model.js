const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { isURL } = require("validator");

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

function urlSchemaNotRequired(opts = {}) {
  const { required } = opts;
  return {
    type: String,
    // required: !!required,
    required: false,
    validate: {
      validator: isURL,
      message: (props) => `${props.value} is not a valid URL`
    }
  };
}

const projectSchema = new Schema({
  title: String,
  shortDesc: String,
  techsUsed: [String],
  description: String,
  imgUrl: String,
  liveLink: urlSchemaNotRequired(),
  gitHubLink: urlSchema(),
  portfolio: { type: Schema.Types.ObjectId, ref: 'Portfolio' }
},
{
  timestamps: true
});

module.exports = model('Project', projectSchema);
