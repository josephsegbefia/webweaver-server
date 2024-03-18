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







module.exports = router;
