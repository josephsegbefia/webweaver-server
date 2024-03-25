const mongoose = require('mongoose');
// const { Schema, model } = mongoose;
const { isAuthenticated } = require('../middleware/jwt.middleware');


const router = require('express').Router();
const User = require('../models/User.model');
const Portfolio = require('../models/Portfolio.model');




module.exports = router;
