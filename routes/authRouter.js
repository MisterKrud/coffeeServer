require('dotenv').config();
const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken')
const passport = require('../config/passport');
const authControllers = require('../controllers/authControllers');




router.post('/login', authControllers.authenticateUser)

router.post('/password-reset', authControllers.requestPasswordReset)
router.post('/password-reset/confirm', authControllers.confirmPasswordReset)


module.exports = router