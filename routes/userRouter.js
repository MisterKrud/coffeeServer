require('dotenv').config();
const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken')
const db = require('../db/queries');
const passport = require('../config/passport');
const userControllers = require('../controllers/userControllers')
const authControllers = require('../controllers/authControllers')
const { appendFile } = require('node:fs');





router.get('/', authControllers.authenticateJWT,userControllers.getUserById, (req, res) => {
    return res.send(req.targetUser)
})

router.get('/lastOrder', authControllers.authenticateJWT, userControllers.getUsersLastOrder, (req, res) => {
    return res.json(req.lastOrder)
})

router.get('/allOrders',authControllers.authenticateJWT, userControllers.getAllUserOrders, (req, res) => {
    return res.json(req.userOrders)
})

router.delete('/deleteLastOrder', authControllers.authenticateJWT,userControllers.deleteLastOrder, (req, res) => {
    return res.json(req.lastOrder)
})


router.post('/newOrder', authControllers.authenticateJWT, userControllers.submitCart, (req, res) => {
    return res.send(req.cart)
})
module.exports = router;