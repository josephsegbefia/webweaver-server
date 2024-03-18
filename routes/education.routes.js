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


router.get('/portfolios/:uniqueIdentifier/educations', (req, res, next) => {

  const { uniqueIdentifier } = req.params;
  const { limit, offset } = req.query;

  const limitValue = parseInt(limit) || 3;
  const offsetValue = parseInt(offset) || 0;

  Portfolio.findOne({ uniqueIdentifier })
    .populate('educations', '-__v')
    .select('educations')
    .then(portfolio => {
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

      const totalCount = portfolio.educations.length;

      const totalPages = Math.ceil(totalCount / limitValue);


      Portfolio.findOne({ uniqueIdentifier })
        .populate({
          path: 'educations',
          select: '-__v',
          options: {
            limit: limitValue,
            skip: offsetValue
          }
        })
        .select('educations')
        .then(paginatedPortfolio => {
          res.status(200).json({ educations: paginatedPortfolio.educations, totalPages });
        })
        .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }));
    })
    .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }));
})


router.put('/portfolios/:uniqueIdentifier/educations/:educationId', isAuthenticated, async (req, res, next) => {
  try {
    const { uniqueIdentifier, educationId } = req.params;
  // Extract the fields to be updated from the request body
  const { schoolName, beginDate, endDate, program, educationType, earnedCert } = req.body;
    const portfolio = await Portfolio.findOne({ uniqueIdentifier: uniqueIdentifier}).populate('educations')
    if(!portfolio){
      return res.status(404).json({ message: 'Portfolio not found!'});
    };

    const educationToUpdate = portfolio.educations.find(education => education._id.toString() === educationId);

    if(!educationToUpdate){
      res.status(404).json({ message: 'Education was not found in your portfolio'})
    }

    educationToUpdate.schoolName = schoolName;
    educationToUpdate.beginDate = beginDate;
    educationToUpdate.endDate = endDate;
    educationToUpdate.educationType = educationType;
    educationToUpdate.program = program;
    educationToUpdate.earnedCert = earnedCert;
    // projectToUpdate.portfolio = portfolio._id;
    await educationToUpdate.save()
    // const projectToUpdate = await portfolio.projects

    res.status(200).json(educationToUpdate);

  }catch(error){
    console.log(error);
    res.status(500).json({message: "Ooops something happened!"})
  }
});


router.delete('/portfolios/:uniqueIdentifier/educations/:educationId', isAuthenticated, async (req, res, next) => {
  try {
    const { uniqueIdentifier, educationId } = req.params;

    // Find the portfolio based on the unique identifier
    const portfolio = await Portfolio.findOne({ uniqueIdentifier }).populate('educations');

    // Check if the portfolio exists
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found!' });
    }

    // Find the index of the education within the portfolio's projects array
    const educationIndex = portfolio.educations.findIndex(education => education._id.toString() === educationId);

    // Check if the education exists in the portfolio
    if (educationIndex === -1) {
      return res.status(404).json({ message: 'Project not found in your portfolio' });
    }

    // Remove the education from the projects array
    portfolio.educations.splice(projectIndex, 1);

    // Save the updated portfolio without the deleted project
    await portfolio.save();

    // Delete the project from the database
    await Education.findByIdAndDelete(projectId);

    res.status(200).json({ message: 'Education deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Oops! Something went wrong.' });
  }
});







module.exports = router;
