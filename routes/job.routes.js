const mongoose = require('mongoose');
// const { Schema, model } = mongoose;
const { isAuthenticated } = require('../middleware/jwt.middleware');

const router = require('express').Router();
const Job = require("../models/Job.model");
const Portfolio = require("../models/Portfolio.model");


router.post('/portfolios/:uniqueIdentifier/jobs', isAuthenticated, async (req, res, next) => {
  try {
    const { companyName, position, description, appliedDate, status, cv, coverLetter, otherDocs } = req.body;
    const { uniqueIdentifier } = req.params;

    const foundPortfolio = await Portfolio.findOne({ uniqueIdentifier: uniqueIdentifier });

    if (!foundPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const newJob = await Job.create({ companyName, position, description, appliedDate, status, cv, coverLetter, otherDocs, portfolio: foundPortfolio._id });

    if (!newJob) {
      return res.status(500).json({ message: 'Failed to create job tracking' });
    }

    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { uniqueIdentifier: uniqueIdentifier },
      { $push: { jobs: newJob._id }},
      { new: true }
    );

    if (!updatedPortfolio) {
      return res.status(500).json({ message: 'Failed to update portfolio' });
    }

    res.status(200).json({ newJob, message: 'Job tracking started!' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Oops, something went wrong!' });
  }
});

module.exports = router;
