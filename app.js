require('dotenv').config();
const express = require('express');
const passport = require('passport');//needed?
const path = require('node:path');
const prisma = require('./lib/prisma'); //needed?
const router = require('./routes/router');
const userRouter = require('./routes/userRouter');
const cors = require('cors')
;
const app = express();
const assestsPath = path.join(__dirname, 'public');

app.use(express.static(assestsPath));
app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use(cors());

app.use((req, res, next) => {
    res.locals.user = req.user;
    next()
});
app.use('/users', userRouter);
app.use('/', router);


const PORT = process.env.PORT || 3000
app.listen(PORT, error => {
    if(error) {
        throw error
    }
    console.log(`Coffee server active on port: ${PORT}`)
})
