const mongoose = require('mongoose');
const { Schema, model } = mongoose;


const experienceSchema = new Schema({
  company: { type: String, required: true},
  startDate: {type: String, required: true},
  endDate: {type: String, required: true},
  position: {type: String, required: true},
  responsibilities: [String],
  portfolio: { type: Schema.Types.ObjectId, ref: 'Portfolio' }
},
{
  timestamps: true
});

module.exports = model('Experience', experienceSchema);
