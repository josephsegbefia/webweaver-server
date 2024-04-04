const express = require("express");
const User = require("../models/User.model");

const router = express.Router();


router.get('/users', (req, res, next) => {
  User.find()
    .select('-__v -password -emailToken -passwordResetToken')
    .then((users) => {
      res.status(200).json({users: users})
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error'});
    })
})


module.exports = router;
