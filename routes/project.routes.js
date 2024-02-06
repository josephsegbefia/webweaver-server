const mongoose = require('mongoose');
// const { Schema, model } = mongoose;

const router = require('express').Router();
const Project = require('../models/Project.model');


router.post('/projects', (req, res, next) => {
  const {title, description, imgUrl } = req.body;

  Project.create({
    title, description, imgUrl
  })
  .then((response) => res.json(response))
  .catch((error) => res.json(error))
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
