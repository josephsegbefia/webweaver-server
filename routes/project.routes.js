const mongoose = require('mongoose');
// const { Schema, model } = mongoose;

const router = require('express').Router();
const Project = require('../models/Project.model');
const Portfolio = require('../models/Portfolio.model');


router.post('/portfolios/:uniqueIdentifier/projects', (req, res, next) => {
  const {title, description, imgUrl, shortDesc, techsUsed } = req.body;
  const { uniqueIdentifier } = req.params;

  Project.create({
    title, description, imgUrl, shortDesc, techsUsed
  })
  .then((newProject) => {
    return Portfolio.findOneAndUpdate(uniqueIdentifier, {
      $push: { projects: newProject._id }
    })
  })
  .then((response) => {
    res.status(200).json({ message: 'Nice work on adding a new project!'})
  })
  .catch((error) => {
    console.log(error);
    res.status(500).json({ message: 'Ooopps! Something went wrong.'})
  })
});

router.get('/projects', (req, res, next) => {
  Project.find()
    .then(allProjects => res.status(200).json(allProjects))
    .catch(error => res.json(error));
})

router.get('/projects/:projectId', (req, res, next) => {
  const { projectId } = req.params;

  if(!mongoose.Types.ObjectId.isValid(projectId)){
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Project.findById(projectId)
    .then(project => res.status(200).json(project))
    .catch(error => res.json(error));
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
