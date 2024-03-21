const express = require('express');
const Portfolio = require('../models/Portfolio.model');
const Message = require('../models/Message.model');
const mongoose = require('mongoose');

const router = express.Router();


// Create a message --POST-- /api/portfolios/:uniqueIdentifier/messages
router.post('/portfolios/:uniqueIdentifier/messages', async (req, res, next) => {
  try {
    const { senderName, subject, senderEmail, content } = req.body;
    const { uniqueIdentifier } = req.params;

    const foundPortfolio = await Portfolio.findOne({ uniqueIdentifier });
    const newMessage = await Message.create({ senderName, senderEmail, content, portfolio: foundPortfolio._id });
    const updatedPortfolio = await Portfolio.findOneAndUpdate({ uniqueIdentifier: uniqueIdentifier}, {
      $push: { messages: newMessage._id}
    });

    res.status(200).json({ newMessage, message: 'Thank you for reaching out' });

  }catch(error){
    console.log(error);
    res.status(500).json({ message: 'Ooops, something went wrong!'});
  }
})

// Get all messages belonging to a portfolio --GET-- /api/portfolios/:uniqueIndentifier/messages
router.get('/portfolios/:uniqueIdentifier/messages', (req, res, next) => {
  const { uniqueIdentifier } = req.params;

  Portfolio.findOne({ uniqueIdentifier })
    .populate('messages', '-__v')
    .select('messages')
    .then(portfolio => {
      if(!portfolio){
        return res.status(404).json({ message: 'Portfolio not found' });
      }
      res.status(200).json(portfolio.messages);
    })
    .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }))
});

// View one message from the portfolio -- GET-- /api/portfolios/:uniqueIdentifier/messages/:messageId
router.get('/portfolios/:uniqueIdentifier/messages/:messageId', (req, res, next) => {
  const { uniqueIdentifier, messageId } = req.params;

  Portfolio.findOne({ uniqueIdentifier })
    .populate({
      path: 'messages',
      match: { _id: messageId },
      select: '__v'
    })
    .select('messages')
    .then(portfolio => {
      if (!portfolio || !portfolio.messages || portfolio.messages.length === 0){
        res.status(404).json({ message: 'Message not found' })
      }
      res.status(200).json(portfolio.messages[0]);
    })
    .catch(error => res.status(500).json({ message: 'Ooops, something went wrong!' }))
})


// Delete a message --DELETE-- /api/portfolios/:uniqueIdentifier/messages/:messageId
router.delete('/portfolios/:uniqueIdentifier/messages/:messageId', async (req, res, next) => {
  try {
    const { uniqueIdentifier, messageId } = req.params;

    // Find the portfolio based on the unique identifier
    const portfolio = await Portfolio.findOne({ uniqueIdentifier }).populate('messages');

    // Check if the portfolio exists
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found!' });
    }

    // Find the index of the project within the portfolio's projects array
    const messageIndex = portfolio.messages.findIndex(message => message._id.toString() === messageId);

    // Check if the project exists in the portfolio
    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found in your portfolio' });
    }

    // Remove the project from the projects array
    portfolio.messages.splice(messageIndex, 1);

    // Save the updated portfolio without the deleted project
    await portfolio.save();

    // Delete the project from the database
    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Oops! Something went wrong.' });
  }
});

module.exports = router;
