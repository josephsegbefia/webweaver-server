const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const crypto = require("crypto");
const { sendVerificationMail } = require("../config/sendVerificationMail");
const { sendPasswordResetEmail } = require("../config/sendPasswordResetEmail");

const { isAuthenticated } = require("./../middleware/jwt.middleware");
const router = express.Router();
const saltRounds = 10;

// Post
router.post("/signup", (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const name = firstName.toLowerCase();
  const surname = lastName.toLowerCase();
  const hex = crypto.randomBytes(64).toString("hex").slice(0, 6)
  const uniqueIdentifier = `${name}-${surname}-${hex}`;

  // Check if the email or password or name is provided as an empty string
  if (email === "" || password === "" || firstName === "" || lastName === "") {
    res.status(400).json({ message: "Provide email, first name, last name" });
    return;
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address" });
    return;
  }

  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter."
    });
    return;
  }

  //   Check the users collection to see if a user with the same email already exists
  User.findOne({ email }).then((foundUser) => {
    if (foundUser) {
      res.status(400).json({
        message: "User already exists. Log in with your email and password"
      });
      return;
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    return User.create({
      email,
      firstName,
      lastName,
      uniqueIdentifier: uniqueIdentifier,
      password: hashedPassword,
      emailToken: crypto.randomBytes(64).toString("hex"),
      passwordResetToken: crypto.randomBytes(64).toString("hex"),
      profile: null,
    })
      .then((createdUser) => {
        const {
          email,
          firstName,
          lastName,
          _id,
          emailToken,
          passwordResetToken
        } = createdUser;

        const user = {
          email,
          firstName,
          lastName,
          _id,
          emailToken,
          passwordResetToken
        };
        sendVerificationMail(user);
        res.status(201).json({ user: user });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
      });
  });
});

// POST /auth/login - verifies email and password and returns JWT
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  //Check if email and password are provided as empty strings
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password" });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      if (!foundUser.isVerified) {
        res.status(401).json({
          message:
            "Please verify your account before trying to login. A verification link has been sent to you"
        });
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        const { _id, email, firstName, lastName } = foundUser;

        const payload = { _id, email, firstName, lastName };
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h"
        });
        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({
          message: "Unable to authenticate the user. Wrong email or password"
        });
      }
    })
    .catch((err) => res.status(500).json({ message: "Internal Server Error" }));
});

router.post("/verify-email", async (req, res, next) => {
  try {
    const emailToken = req.body.emailToken;
    if (!emailToken)
      return res.status(404).json({ message: "Email Token not found." });

    const user = await User.findOne({ emailToken });
    if (user) {
      user.emailToken = null;
      user.isVerified = true;
      await user.save();

      res.status(200).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified
      });
    } else {
      res.status(404).json("Email verification failed, invalid token");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

router.post("/password-reset", async (req, res, next) => {
  try {
    const { passwordResetToken, password } = req.body;
    if (!passwordResetToken) {
      return res.status(404).json({ message: "Password token not found" });
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter."
      });
      return;
    }

    const user = await User.findOne({ passwordResetToken });
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    user.password = hashedPassword;
    user.passwordResetToken = crypto.randomBytes(64).toString("hex");
    await user.save();
    res.status(200).json({ message: "Password updated!" });
  } catch (error) {
    console.log(error);
    res.status(500).json("Password reset token is invalid");
  }
});

router.post("/password-reset-email", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      sendPasswordResetEmail(user);
      res.status(200).json({
        user: user,
        message: "Password reset email has been sent to your email"
      });
    } else {
      res.status(404).json({ message: "User with that email does not exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Email not Found" });
  }
});

router.get("/verify", isAuthenticated, (req, res, next) => {
  //If JWT token is valid the payload gets decoded by the isAuthenticated middleware and made available on the req.payload
  console.log(`req.payload`, req.payload);

  //Send back the object with the user data previously set as the token payload
  res.status(200).json(req.payload);
});
module.exports = router;
