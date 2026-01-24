require('dotenv').config();
const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken')
const passport = require('../config/passport');
const authControllers = require('../controllers/authControllers');
const { useReducer } = require('react');

// router.post('/signup', authControllers.createUser, (req, res) => {
//     return res.json(req.user)
// })

router.post('/login', authControllers.authenticateUser)


module.exports = router