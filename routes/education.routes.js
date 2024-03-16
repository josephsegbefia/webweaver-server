const mongoose = require('mongoose');
// const { Schema, model } = mongoose;
const { isAuthenticated } = require('../middleware/jwt.middleware');


const router = require('express').Router();
const Education = require('../models/Education.model');
const Portfolio = require('../models/Portfolio.model');


router.post('/portfolios/:uniqueIdentifier/educations', async (req, res, next) => {
  try {
    const { schoolName, beginDate, endDate, program, educationType, earnedCert } = req.body;
    const { uniqueIdentifier } = req.params;

    const foundPortfolio = await Portfolio.findOne({ uniqueIdentifier: uniqueIdentifier });

    if (!foundPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const newEducation = await Education.create({ schoolName, beginDate, endDate, program, educationType, earnedCert, portfolio: foundPortfolio._id });

    if (!newEducation) {
      return res.status(500).json({ message: 'Failed to create education' });
    }

    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { uniqueIdentifier: uniqueIdentifier },
      { $push: { educations: newEducation._id }},
      { new: true }
    );

    if (!updatedPortfolio) {
      return res.status(500).json({ message: 'Failed to update portfolio' });
    }

    res.status(200).json({ newEducation, message: 'Nice work on adding a new education!' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Oops, something went wrong!' });
  }
});






module.exports = router;
