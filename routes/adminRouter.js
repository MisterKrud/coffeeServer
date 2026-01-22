const { Router } = require('express');
const router = Router();
const passport = require('../config/passport');
const userControllers = require('../controllers/userControllers')
const authControllers = require("../controllers/authControllers")
const adminControllers= require("../controllers/adminControllers")

router.get('/', 
  adminControllers.getTodaysOrders,

  (req, res) => {
    res.json(req.todaysOrders)
})

module.exports = router