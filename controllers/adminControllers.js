require("dotenv").config();
const passport = require('passport');
const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const jwt = require('jsonwebtoken');
const { body, validationResult, matchedData } = require("express-validator");

const getTodaysOrders = async(req, res, next) => {
   try{
    const todaysOrders = await db.getTodaysOrders()
    console.log(todaysOrders)
   req.todaysOrders =   todaysOrders
   console.log(req.todaysOrders)
    res.render('/', {
        orders: req.todaysOrders
    })
    next()
   }
   catch(err){
   next(err)
   }
}


module.exports = {getTodaysOrders}