const express = require("express");
const User = require("../models/User.model");
const Portfolio = require('../models/Portfolio.model');
const router = express.Router();
const crypto = require("crypto");


const { sendVerificationMail } = require("../config/sendVerificationMail");

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
});

// router.get('/user', (req, res, next) => {
//   const { uniqueIdentifier } = req.query;

//   User.findOne({ uniqueIdentifier: uniqueIdentifier })
//     .populate('portfolio')
//     .then((user) => {
//       res.status(200).json({user: user})
//     })
//     .catch((error) => {
//       console.log(error);
//       res.status(500).json({ message: "Not found"});
//     })
// })

router.get('/user', async (req, res, next) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email })
                    .select('isAdmin email, uniqueIdentifier isVerified');
    if(!user){
      return res.status(500).json({ message: "User found"});
    }

    const portfolio = await Portfolio.findOne({ uniqueIdentifier: user.uniqueIdentifier })
                        .select('phone location bio linkedInURL gitHubURL skills interests languages expereinces jobs projects projects messages ')
                        .populate('skills')
                        .populate('languages')
                        .populate('jobs')
                        .populate('interests')
                        .populate('projects')
                        .populate('experiences')
                        .populate('messages')

    if(!portfolio){
      return res.status(500).json({ message: "Portfolio not found!"});
    }

    res.status(200).json({ user, portfolio: portfolio })
  }catch(error){
    console.log(error);
    res.status(500).json({ message: "Internal Server Error"});
  }
});


router.put('/users/modify', async (req, res, next) => {
  try {
    const { useremail } = req.query;
    const { email, isAdmin, uniqueIdentifier } = req.body;


    const user = await User.findOne({ email: useremail }).select('firstName email isAdmin uniqueIdentifier isVerified emailToken')

    console.log("USER===>", user)
    if(!user){

      return res.status(500).json({ message: "User not found!"});
    }

    user.email = email;
    user.isAdmin = isAdmin;
    user.uniqueIdentifier = uniqueIdentifier;
    user.isVerified = false;
    user.emailToken = crypto.randomBytes(64).toString("hex");


    const updatedUser = await user.save()

    sendVerificationMail(updatedUser);

    res.status(200).json({ updatedUser });
  }catch(error){
    console.log(error)
    res.status(500).json({ message: "Internal Server Error"});
  }

})


module.exports = router;
