require('dotenv').config();
const express = require('express');
const passport = require('passport');//needed?
const path = require('node:path');
const prisma = require('./lib/prisma'); //needed?
const jwt = require('jsonwebtoken')
const router = require('./routes/router');
const userRouter = require('./routes/userRouter');
const authRouter = require('./routes/authRouter')
const adminRouter = require('./routes/adminRouter')
const cors = require('cors');
const app = express();
const assestsPath = path.join(__dirname, 'public');
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(assestsPath));
app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use(cors());

app.use((req, res, next) => {
    res.locals.user = req.user;
    next()
});
app.use('/users', userRouter);
app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/', router);

app.use((err, req, res, next) => {
  console.error(err); // yes, log it

  const status = err.status || 500;

  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 8080
app.listen(PORT, error => {
    if(error) {
        throw error
    }
    console.log(`Coffee server active on port: ${PORT}`)
})
