const express = require("express");
const User = require("../models/User.model");
const Portfolio = require('../models/Portfolio.model');
const Project = require('../models/Project.model');
const Experience = require('../models/Experience.model');
const Education = require('../models/Education.model');
const Job = require('../models/Job.model');
const Message = require('../models/Message.model');
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
});



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
                        // .populate('skills')
                        // .populate('languages')
                        .populate('jobs')
                        // .populate('interests')
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

    const updatedUser = await user.save()

    res.status(200).json({ updatedUser });
  }catch(error){
    console.log(error)
    res.status(500).json({ message: "Internal Server Error"});
  }
});

router.delete('/users', async (req, res, next) => {
  try {
    const { useremail } = req.query;
    const user = await User.findOne({ email: useremail });
    const portfolio = await Portfolio.findOne({ user: user._id });

    await Project.deleteMany({ portfolio: portfolio._id });
    await Education.deleteMany({ portfolio: portfolio._id });
    await Job.deleteMany({ portfolio: portfolio._id })
    await Message.deleteMany({ portfolio: portfolio._id })
    await portfolio.deleteOne();
    await user.deleteOne();

    res.status(200).json({ message: "User and associated portfolio deleted"});


  }catch(error){
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})


module.exports = router;
