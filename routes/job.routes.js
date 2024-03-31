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
  console.log(fileUrls);
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


// BEGINNING OF ROUTES

router.post('/portfolios/:uniqueIdentifier/jobs', isAuthenticated, async (req, res, next) => {
  try {
    const { companyName, position, jobDescription, jobLocation, appliedDate, status, cv, coverLetter, otherDocs } = req.body;
    const { uniqueIdentifier } = req.params;

    const foundPortfolio = await Portfolio.findOne({ uniqueIdentifier: uniqueIdentifier });

    if (!foundPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const newJob = await Job.create({ companyName, position, jobDescription, jobLocation, appliedDate, status, cv, coverLetter, otherDocs, portfolio: foundPortfolio._id });

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


router.get('/portfolios/:uniqueIdentifier/jobs/:jobId', (req, res, next) => {
  const { uniqueIdentifier, jobId } = req.params;

  Portfolio.findOne({ uniqueIdentifier })
    .populate({
      path: 'jobs',
      // Filter projects by the provided project ID
      match: { _id: jobId },
      // Exclude __v fields from the populated project
      select: '-__v'
    })
    // Select only the jobs field from the Portfolio object
    .select('jobs')
    .then(portfolio => {
      if (!portfolio || !portfolio.jobs || portfolio.jobs.length === 0) {
        return res.status(404).json({ message: 'Job not found' });
      }
      // Return the first (and only) job in the array
      res.status(200).json(portfolio.jobs[0]);
    })
    .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }));
});


router.put('/portfolios/:uniqueIdentifier/jobs/:jobId', isAuthenticated, async (req, res, next) => {
  try {
    const { uniqueIdentifier, jobId } = req.params;
  // Extract the fields to be updated from the request body
    const { companyName, position, jobDescription, jobLocation, appliedDate, status, cv, coverLetter, otherDocs } = req.body;
    const portfolio = await Portfolio.findOne({ uniqueIdentifier: uniqueIdentifier}).populate('jobs')
    if(!portfolio){
      return res.status(404).json({ message: 'Portfolio not found!'});
    };

    const jobToUpdate = portfolio.jobs.find(job => job._id.toString() === jobId);

    if(!jobToUpdate){
      res.status(404).json({ message: 'Job was not found in your portfolio'})
    }

    jobToUpdate.companyName = companyName;
    jobToUpdate.position = position;
    jobToUpdate.jobDescription = jobDescription;
    jobToUpdate.jobLocation = jobLocation;
    jobToUpdate.appliedDate = appliedDate;
    jobToUpdate.status = status;
    jobToUpdate.cv = cv;
    jobToUpdate.coverLetter = coverLetter;
    jobToUpdate.otherDocs = otherDocs;
    // projectToUpdate.portfolio = portfolio._id;
    await jobToUpdate.save()
    // const projectToUpdate = await portfolio.projects

    res.status(200).json(jobToUpdate);

  }catch(error){
    console.log(error);
    res.status(500).json({message: "Ooops something happened!"})
  }
});



// router.delete('/portfolios/:uniqueIdentifier/projects/:projectId', isAuthenticated, async (req, res, next) => {
//   try {
//     const { uniqueIdentifier, projectId } = req.params;

//     // Find the portfolio based on the unique identifier
//     const portfolio = await Portfolio.findOne({ uniqueIdentifier }).populate('projects');

//     // Check if the portfolio exists
//     if (!portfolio) {
//       return res.status(404).json({ message: 'Portfolio not found!' });
//     }

//     // Find the index of the project within the portfolio's projects array
//     const projectIndex = portfolio.projects.findIndex(project => project._id.toString() === projectId);

//     // Check if the project exists in the portfolio
//     if (projectIndex === -1) {
//       return res.status(404).json({ message: 'Project not found in your portfolio' });
//     }

//     // Remove the project from the projects array
//     portfolio.projects.splice(projectIndex, 1);

//     // Save the updated portfolio without the deleted project
//     await portfolio.save();

//     // Delete the project from the database
//     await Project.findByIdAndDelete(projectId);

//     res.status(200).json({ message: 'Project deleted successfully' });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: 'Oops! Something went wrong.' });
//   }
// });



module.exports = router;
