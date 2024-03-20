const mongoose = require('mongoose');
// const { Schema, model } = mongoose;
const { isAuthenticated } = require('../middleware/jwt.middleware');


const router = require('express').Router();
const Experience = require('../models/Experience.model');
const Portfolio = require('../models/Portfolio.model');


router.post('/portfolios/:uniqueIdentifier/experiences', isAuthenticated, async (req, res, next) => {
  try {
    const { company, startDate, endDate, position, responsibilities, location } = req.body;
    const { uniqueIdentifier } = req.params;

    const foundPortfolio = await Portfolio.findOne({ uniqueIdentifier: uniqueIdentifier });

    if (!foundPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const newExperience = await Experience.create({ company, startDate, endDate, position, responsibilities, location, portfolio: foundPortfolio._id });

    if (!newExperience) {
      return res.status(500).json({ message: 'Failed to create experience' });
    }

    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { uniqueIdentifier: uniqueIdentifier },
      { $push: { experiences: newExperience._id }},
      { new: true }
    );

    if (!updatedPortfolio) {
      return res.status(500).json({ message: 'Failed to update portfolio' });
    }

    res.status(200).json({ newExperience, message: 'Nice work on adding a new experience!' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Oops, something went wrong!' });
  }
});


router.get('/portfolios/:uniqueIdentifier/experiences', (req, res, next) => {

  const { uniqueIdentifier } = req.params;
  const { limit, offset } = req.query;

  const limitValue = parseInt(limit) || 3;
  const offsetValue = parseInt(offset) || 0;

  Portfolio.findOne({ uniqueIdentifier })
    .populate('experiences', '-__v')
    .select('experiences')
    .then(portfolio => {
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

      const totalCount = portfolio.experiences.length;

      const totalPages = Math.ceil(totalCount / limitValue);


      Portfolio.findOne({ uniqueIdentifier })
        .populate({
          path: 'experiences',
          select: '-__v',
          options: {
            limit: limitValue,
            skip: offsetValue
          }
        })
        .select('experiences')
        .then(paginatedPortfolio => {
          res.status(200).json({ experiences: paginatedPortfolio.experiences, totalPages });
        })
        .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }));
    })
    .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }));
})



router.get('/portfolios/:uniqueIdentifier/experiences/:experienceId', (req, res, next) => {
  const { uniqueIdentifier, experienceId } = req.params;

  Portfolio.findOne({ uniqueIdentifier })
    .populate({
      path: 'experiences',
      // Filter projects by the provided project ID
      match: { _id: experienceId },
      // Exclude __v fields from the populated project
      select: '-__v'
    })
    // Select only the projects field from the Portfolio object
    .select('experiences')
    .then(portfolio => {
      if (!portfolio || !portfolio.experiences || portfolio.experiences.length === 0) {
        return res.status(404).json({ message: 'Experience not found' });
      }
      // Return the first (and only) project in the arrays
      res.status(200).json(portfolio.experiences[0]);
    })
    .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }));
});


router.put('/portfolios/:uniqueIdentifier/experiences/:experienceId', isAuthenticated, async (req, res, next) => {
  try {
    const { uniqueIdentifier, experienceId } = req.params;
  // Extract the fields to be updated from the request body
    const { company, startDate, endDate, position, responsibilities, location } = req.body;
    const portfolio = await Portfolio.findOne({ uniqueIdentifier: uniqueIdentifier}).populate('experiences')
    if(!portfolio){
      return res.status(404).json({ message: 'Portfolio not found!'});
    };

    const experienceToUpdate = portfolio.experiences.find(experience => experience._id.toString() === experienceId);

    if(!experienceToUpdate){
      res.status(404).json({ message: 'Experience was not found in your portfolio'})
    }

    experienceToUpdate.company = company;
    experienceToUpdate.startDate = startDate;
    experienceToUpdate.endDate = endDate;
    experienceToUpdate.position = position;
    experienceToUpdate.responsibilities = responsibilities;
    // projectToUpdate.portfolio = portfolio._id;
    await experienceToUpdate.save()
    // const projectToUpdate = await portfolio.projects

    res.status(200).json(experienceToUpdate);

  }catch(error){
    console.log(error);
    res.status(500).json({message: "Ooops something happened!"})
  }
});


router.delete('/portfolios/:uniqueIdentifier/experiences/:experienceId', isAuthenticated, async (req, res, next) => {
  try {
    const { uniqueIdentifier, experienceId } = req.params;

    // Find the portfolio based on the unique identifier
    const portfolio = await Portfolio.findOne({ uniqueIdentifier }).populate('experiences');

    // Check if the portfolio exists
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found!' });
    }

    // Find the index of the education within the portfolio's projects array
    const experienceIndex = portfolio.experiences.findIndex(experience => experience._id.toString() === experienceId);

    // Check if the education exists in the portfolio
    if (experienceIndex === -1) {
      return res.status(404).json({ message: 'Experience not found in your portfolio' });
    }

    // Remove the education from the projects array
    portfolio.experiences.splice(experienceIndex, 1);

    // Save the updated portfolio without the deleted project
    await portfolio.save();

    // Delete the project from the database
    await Experience.findByIdAndDelete(educationId);

    res.status(200).json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Oops! Something went wrong.' });
  }
});







module.exports = router;
