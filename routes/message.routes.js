const express = require('express');
const Portfolio = require('../models/Portfolio.model');
const Message = require('../models/Message.model');
const mongoose = require('mongoose');

const router = express.Router();

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
module.exports = router;
