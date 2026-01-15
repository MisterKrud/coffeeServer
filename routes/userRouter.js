const { Router } = require('express');
const router = Router();
const db = require('../db/queries');
const passport = require('../config/passport');
const userControllers = require('../controllers/userControllers')
const { appendFile } = require('node:fs');



router.get('/', userControllers.getAllUsers, (req, res) => {
    return res.send(req.allUsers)
})

router.get('/:userId', userControllers.getUserById, (req, res) => {
    return res.send(req.targetUser)
})

router.get('/:userId/lastOrder', userControllers.getUsersLastOrder, (req, res) => {
    return res.json(req.lastOrder)
})

router.delete('/:userId/deleteLastOrder', userControllers.deleteLastOrder, (req, res) => {
    return res.json(req.lastOrder)
})


router.post('/:userId/newOrder', userControllers.submitCart, (req,res) => {
    return res.send(req.cart)
})
module.exports = router;