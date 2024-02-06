const mongoose = require('mongoose');
const { Schema, model } = mongoose;


const projectSchema = new Schema({
  title: String,
  description: String
});

module.exports = module('Project', projectSchema);
