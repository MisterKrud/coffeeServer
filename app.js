require('dotenv').config();
const express = require('express');
const passport = require('passport');//needed?
const path = require('node:path');
const prisma = require('./lib/prisma'); //needed?
const router = require('./routes/router');

const app = express();
const assestsPath = path.join(__dirname, 'public');

app.use(express.static(assestsPath));
app.use(express.urlencoded({extended: false}));

app.use((req, res, next) => {
    res.locals.user = req.user;
    next()
});

app.use('/', router);

const PORT = process.env.PORT || 3000
app.listen(PORT, error => {
    if(error) {
        throw error
    }
    console.log(`Coffee server active on port: ${PORT}`)
})
