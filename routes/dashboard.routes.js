const mongoose = require('mongoose');
// const { Schema, model } = mongoose;
const { isAuthenticated } = require('../middleware/jwt.middleware');
const axios = require("axios");

const QUOTE_API_URL = process.env.QUOTE_URL;
const X_API_KEY = process.env.X_API_KEY;

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

router.get('/motivations', (req, res, next) => {
  axios.get(`${QUOTE_API_URL}quotes?category=hope`, {headers: {"X-Api-Key": X_API_KEY}})
    .then((response) => {
      res.status(200).json(response.data);
    })
    .catch((error) => {
      console.log(error);
    })
})

module.exports = router;
