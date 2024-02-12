const mongoose = require('mongoose');
// const { Schema, model } = mongoose;

const router = require('express').Router();
const Project = require('../models/Project.model');
const Portfolio = require('../models/Portfolio.model');


router.post('/portfolios/:uniqueIdentifier/projects', async (req, res, next) => {
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
    .catch(error => res.status(500).json({ message: 'Internal Server Error', error }));
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
    .catch(error => res.status(500).json({ message: 'Internal Server Error', error }));
});


router.put('/projects/:projectId', (req, res, next) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)){
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Project.findByIdAndUpdate(projectId, req.body, { new: true })
    .then((updatedProject) => res.json(updatedProject))
    .catch(error => res.json(error));
});


router.delete('/projects/:projectId', (req, res, next) => {
  const { projectId } = req.params;

  if(!mongoose.Types.ObjectId.isValid(projectId)){
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Project.findByIdAndDelete(projectId)
    .then(() => res.json({ message: `Project with ${projectId} has been deleted.` }))
    .catch(error => res.json(error));
});


module.exports = router;
