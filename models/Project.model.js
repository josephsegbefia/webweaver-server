const mongoose = require('mongoose');
const { Schema, model } = mongoose;


const projectSchema = new Schema({
  title: String,
  description: String,
  imgUrl: String
},
{
  timestamps: true
});

module.exports = model('Project', projectSchema);
