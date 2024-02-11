const express = require('express');
const crypto = require("crypto");
const Profile = require('../models/Profile.model');
const User = require('../models/User.model');

const router = express.Router();

router.post('/profiles', async (req, res, next) => {
  try {
    const { user, headLine, phone, avatarURL, skills, linkedInURL, gitHubURL } = req.body;
    const profileUser = await User.findById(user);
    const userLastName = profileUser.lastName;
    const userFirstName = profileUser.firstName;
    const userEmail = profileUser.email;

    const name = userFirstName.toLowerCase();
    const surname = userLastName.toLowerCase();
    const hex = crypto.randomBytes(64).toString("hex").slice(0, 6)
    const uniqueIdentifier = `${name}-${surname}-${hex}`;

    const createdProfile = await Profile.create({
      user: user,
      lastName: userLastName,
      firstName: userFirstName,
      email: userEmail,
      headLine,
      phone,
      avatarURL,
      skills,
      linkedInURL,
      gitHubURL,
      uniqueIdentifier: uniqueIdentifier
    });

    console.log(createdProfile._id);

    const updatedUser = await User.findByIdAndUpdate(user, { profile: createdProfile._id }, { new: true });

    res.status(200).json(createdProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/profiles/:uniqueIdentifier', (req, res, next) => {
  const { uniqueIdentifier } = req.params;

  Profile.find({ uniqueIdentifier })
    .then((profile) => {
      res.status(200).json(profile)
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error"})
    })
})
module.exports = router;
