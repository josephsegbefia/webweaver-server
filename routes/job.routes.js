const mongoose = require('mongoose');
// const { Schema, model } = mongoose;
const { isAuthenticated } = require('../middleware/jwt.middleware');

const router = require('express').Router();
const Job = require("../models/Job.model");
const Portfolio = require("../models/Portfolio.model");
const fileUploader = require('../config/cloudinary.config');


// JOB FILES UPLOAD OTHER DOCS

router.post('/supporting-documents/upload', fileUploader.array('otherDocs', 3), (req, res, next) => {

  if (!req.files || req.files.length === 0) {
    next(new Error('No files uploaded'));
    return;
  }

  const fileUrls = req.files.map(file => file.path);
  res.json({ fileUrls });
})

// UPLOAD OF CV
router.post('/resume/upload', fileUploader.single('cv'), (req, res, next) => {
  console.log("File is==>", req.file);

  if(!req.file){
    next(new Error('No file uploaded'));
    return;
  }

  // UPLOAD OF COVER LETTER
  router.post('/coverletter/upload', fileUploader.single('coverLetter'), (req, res, next) => {
    console.log("File is==>", req.file);

    if(!req.file){
      next(new Error('No file uploaded'));
      return;
    }

    res.json({ fileUrl: req.file.path })
  })

  res.json({ fileUrl: req.file.path })
})

router.post('/portfolios/:uniqueIdentifier/jobs', isAuthenticated, async (req, res, next) => {
  try {
    const { companyName, position, description, jobLocation, appliedDate, status, cv, coverLetter, otherDocs } = req.body;
    const { uniqueIdentifier } = req.params;

    const foundPortfolio = await Portfolio.findOne({ uniqueIdentifier: uniqueIdentifier });

    if (!foundPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const newJob = await Job.create({ companyName, position, description, jobLocation, appliedDate, status, cv, coverLetter, otherDocs, portfolio: foundPortfolio._id });

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

router.get('/portfolios/:uniqueIdentifier/jobs', (req, res, next) => {

  const { uniqueIdentifier } = req.params;
  const { limit, offset } = req.query;

  const limitValue = parseInt(limit) || 10;
  const offsetValue = parseInt(offset) || 0;

  Portfolio.findOne({ uniqueIdentifier })
    .populate('jobs', '-__v')
    .select('jobs')
    .then(portfolio => {
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

      const totalCount = portfolio.jobs.length;

      const totalPages = Math.ceil(totalCount / limitValue);


      Portfolio.findOne({ uniqueIdentifier })
        .populate({
          path: 'jobs',
          select: '-__v',
          options: {
            limit: limitValue,
            skip: offsetValue
          }
        })
        .select('jobs')
        .then(paginatedPortfolio => {
          res.status(200).json({ jobs: paginatedPortfolio.jobs, totalPages });
        })
        .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }));
    })
    .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }));
})


module.exports = router;
