const express = require('express');
const crypto = require("crypto");
const Portfolio = require('../models/Portfolio.model');
const User = require('../models/User.model');
const mongoose = require('mongoose');

const router = express.Router();

// Create a portfolio  -- POST -- /api/portfolios
router.post('/portfolios', async (req, res, next) => {
  try {
    const { user, headLine, phone, avatarURL, skills, linkedInURL, gitHubURL } = req.body;
    const portfolioUser = await User.findById(user);
    const userLastName = portfolioUser.lastName;
    const userFirstName = portfolioUser.firstName;
    const userEmail = portfolioUser.email;

    const name = userFirstName.toLowerCase();
    const surname = userLastName.toLowerCase();
    let hex = crypto.randomBytes(64).toString("hex").slice(0, 6)
    let uniqueIdentifier = `${name}-${surname}-${hex}`;

    // Check if a portfolio with the same uniqueIdentifier exists
    const portfolio = await Portfolio.findOne({ uniqueIdentifier });
    if (portfolio){
      console.log('Identifier already exists. But we will create a new one');
      hex = crypto.randomBytes(64).toString("hex").slice(0, 6);
      uniqueIdentifier = `${name}-${surname}-${hex}`;
      return;
    }

    const createdPortfolio = await Portfolio.create({
      user: user,
      lastName: userLastName,
      firstName: userFirstName,
      email: userEmail,
      headLine,
      phone,
      avatarURL,
      skills,
      linkedInURL,
      gitHubURL,
      uniqueIdentifier: uniqueIdentifier,
      projects: []
    });

    console.log(createdPortfolio._id);

    const updatedUser = await User.findByIdAndUpdate(user, { portfolio: createdPortfolio._id }, { new: true });

    res.status(200).json(createdPortfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a users portfolio --GET-- /api/portfolios/:uniqueIdentifier
router.get('/portfolios/:uniqueIdentifier', (req, res, next) => {
  const { uniqueIdentifier } = req.params;

  Portfolio.find({ uniqueIdentifier })
    .populate('projects')
    .then((portfolio) => {
      res.status(200).json(portfolio)
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error"})
    })
})

// Edit a portfolio --PUT-- /api/portfolios/:uniqueIdentifier
router.put('/portfolios/:uniqueIdentifier', (req, res, next) => {
  const { uniqueIdentifier } = req.params;

  Portfolio.findOne({ uniqueIdentifier })
    .then((portfolio) => {
      if(!portfolio){
        res.status(400).json({ message: 'Portfolio not found!'})
      }
    })

  Portfolio.findOneAndUpdate({ uniqueIdentifier: uniqueIdentifier}, req.body, { new: true })
    .then((updatedPortfolio) => {
      res.status(200).json(updatedPortfolio)
    })
    .catch((error) => {
      res.status(500).json('Updated unsucessfull');
    })
})

// Delete a users portfolio --DELETE-- /api/portfolios/:uniqueIdentifier

router.delete('/portfolios/:uniqueIdentifier', async (req, res, next) => {
  try {

  }catch(error){
    console.log(error)
    res.status(500).json({ message: 'Internal Server Error'})
  }
})

module.exports = router;
