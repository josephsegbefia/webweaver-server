const mongoose = require('mongoose');
const { Schema, model } = mongoose;


const experienceSchema = new Schema({
  company: { type: String, required: true},
  location: {type: String, required: true},
  startDate: {type: String, required: true},
  endDate: {type: String},
  position: {type: String, required: true},
  responsibilities: {type: String, required: true},
  // currentPosition: { type: Boolean },
  portfolio: { type: Schema.Types.ObjectId, ref: 'Portfolio' }
},
{
  timestamps: true
});

module.exports = model('Experience', experienceSchema);
