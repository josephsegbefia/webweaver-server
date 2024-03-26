const mongoose = require('mongoose');
// const { Schema, model } = mongoose;
const { isAuthenticated } = require('../middleware/jwt.middleware');


const router = require('express').Router();
const User = require('../models/User.model');
const Portfolio = require('../models/Portfolio.model');


// GET ALL INFO FROM BACKEND FOR DASHBOARD
router.get('/users/:uniqueIdentifier/dashboard', isAuthenticated, async (req, res, next) => {
  try {
    const { uniqueIdentifier } = req.params;

    const portfolio = await Portfolio.find({ uniqueIdentifier })

    res.status(200).json({ message: "success", portfolio: portfolio });
  }catch(error){
    console.log(error)
  }


});

module.exports = router;
