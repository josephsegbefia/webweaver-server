const mongoose = require('mongoose');
// const { Schema, model } = mongoose;
const { isAuthenticated } = require('../middleware/jwt.middleware');


const router = require('express').Router();
const Project = require('../models/Project.model');
const Portfolio = require('../models/Portfolio.model');



router.post('/portfolios/:uniqueIdentifier/projects', isAuthenticated, async (req, res, next) => {
  try{
    const {title, description, imgUrl, shortDesc, techsUsed } = req.body;
    const { uniqueIdentifier } = req.params;

    const foundPortfolio = await Portfolio.findOne({ uniqueIdentifier: uniqueIdentifier });
    const newProject = await Project.create({ title, shortDesc, description, imgUrl, techsUsed, portfolio: foundPortfolio._id});
    const updatedPortfolio = await Portfolio.findOneAndUpdate({ uniqueIdentifier: uniqueIdentifier }, { $push: { projects: newProject._id }});


    res.status(200).json({ newProject, message: 'Nice work on adding a new project!'})

  }catch(error){
    console.log(error)
    res.status(500).json({ message: "Ooops, something went wrong!"})
  }
});

// GET projects from a portfolio --GET-- /api/portfolios/:uniqueIdentifier/projects
router.get('/portfolios/:uniqueIdentifier/projects', (req, res, next) => {

  const { uniqueIdentifier } = req.params;

  Portfolio.findOne({ uniqueIdentifier })
    .populate('projects', '-__v')
    .select('projects')
    .then(portfolio => {
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
      res.status(200).json(portfolio.projects);
    })
    .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }));
})

router.get('/portfolios/:uniqueIdentifier/projects/:projectId', (req, res, next) => {
  const { uniqueIdentifier, projectId } = req.params;

  Portfolio.findOne({ uniqueIdentifier })
    .populate({
      path: 'projects',
      // Filter projects by the provided project ID
      match: { _id: projectId },
      // Exclude __v fields from the populated project
      select: '-__v'
    })
    // Select only the projects field from the Portfolio object
    .select('projects')
    .then(portfolio => {
      if (!portfolio || !portfolio.projects || portfolio.projects.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }
      // Return the first (and only) project in the array
      res.status(200).json(portfolio.projects[0]);
    })
    .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }));
});


router.put('/portfolios/:uniqueIdentifier/projects/:projectId', isAuthenticated, async (req, res, next) => {
  try {
    const { uniqueIdentifier, projectId } = req.params;
  // Extract the fields to be updated from the request body
    const { title, shortDesc, techsUsed, description, imgUrl } = req.body;
    const portfolio = await Portfolio.findOne({ uniqueIdentifier: uniqueIdentifier}).populate('projects')
    if(!portfolio){
      return res.status(404).json({ message: 'Portfolio not found!'});
    };

    const projectToUpdate = portfolio.projects.find(project => project._id.toString() === projectId);

    if(!projectToUpdate){
      res.status(404).json({ message: 'Project was not found in your portfolio'})
    }

    projectToUpdate.title = title;
    projectToUpdate.shortDesc = shortDesc;
    projectToUpdate.description = description;
    projectToUpdate.imgUrl = imgUrl;
    projectToUpdate.techsUsed = techsUsed;
    // projectToUpdate.portfolio = portfolio._id;
    await projectToUpdate.save()
    // const projectToUpdate = await portfolio.projects

    res.status(200).json(projectToUpdate);

  }catch(error){
    console.log(error);
    res.status(500).json({message: "Ooops something happened!"})
  }
});



router.delete('/portfolios/:uniqueIdentifier/projects/:projectId', isAuthenticated, async (req, res, next) => {
  try {
    const { uniqueIdentifier, projectId } = req.params;

    // Find the portfolio based on the unique identifier
    const portfolio = await Portfolio.findOne({ uniqueIdentifier }).populate('projects');

    // Check if the portfolio exists
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found!' });
    }

    // Find the index of the project within the portfolio's projects array
    const projectIndex = portfolio.projects.findIndex(project => project._id.toString() === projectId);

    // Check if the project exists in the portfolio
    if (projectIndex === -1) {
      return res.status(404).json({ message: 'Project not found in your portfolio' });
    }

    // Remove the project from the projects array
    portfolio.projects.splice(projectIndex, 1);

    // Save the updated portfolio without the deleted project
    await portfolio.save();

    // Delete the project from the database
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Oops! Something went wrong.' });
  }
});



module.exports = router;
