const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { isURL, isEmail } = require("validator");


const educationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User'},
  // description: { type: String, required: true },
  schoolName: { type: String, required: true },
  program: { type: String, required: true },
  beginDate: { type: String, required: true },
  endDate: { type: String, required: true },
  educationType: { type: String, enum: ['Self tutored', 'Bootcamp', 'Tertiary education'], required: true },
  earnedCert: { type: String, enum: ['Under graduate', 'Post graduate', 'other'], required: true },
  uniqueIdentifier: { type: String},
  portfolio: { type: Schema.Types.ObjectId, ref: 'Portfolio' }
})


module.exports = model("Education", educationSchema);
