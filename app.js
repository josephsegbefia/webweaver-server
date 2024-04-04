// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const { isAuthenticated } = require("./middleware/jwt.middleware");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const projectRouter = require('./routes/project.routes');
app.use('/api', projectRouter);

const authRouter = require("./routes/auth.routes");
app.use("/auth", authRouter);

const portfolioRouter = require('./routes/portfolio.routes');
app.use('/api', portfolioRouter);

const educationRouter = require('./routes/education.routes');
app.use('/api', educationRouter);

const experienceRouter = require('./routes/experience.routes');
app.use('/api', experienceRouter);

const messageRouter = require('./routes/message.routes');
app.use('/api', messageRouter);

const dashboardRouter = require('./routes/dashboard.routes');
app.use('/api', dashboardRouter);

const jobRouter = require('./routes/job.routes');
app.use('/api', jobRouter)

const aiRouter = require('./routes/aiassistant.routes');
app.use('/api', aiRouter);

const userRouter = require('./routes/user.routes');
app.use('/api', userRouter);
// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
