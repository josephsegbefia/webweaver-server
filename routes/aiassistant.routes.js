const mongoose = require('mongoose');
const router = require('express').Router();
// const { Schema, model } = mongoose;
const { isAuthenticated } = require('../middleware/jwt.middleware');
const { Configuration, OpenAIApi} = require("openai");

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });




module.exports = router;
