require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");

const getUserById = async (req, res, next) => {
    const id = Number(req.params.userId);
    req.targetUser = await db.getUserById(id)
   next()
}

const getAllUsers = async (req, res, next) => {
   const allUsers = await db.getAllUsers();
    return res.send(allUsers)
}


const submitCart = async (req, res, next) => {
    const userId = Number(req.params.userId)
    const cartItems =  [
    {
      itemName: 'Cappuccino',
      size: 'Large',
      unitPrice: 6.1,
      quantity: 2,
      lineTotal: 12.2,
      notes: ['Skim milk', 'Extra hot']
    },
    {
      itemName: 'Chai Latte',
      size: 'Medium',
      unitPrice: 5.9,
      quantity: 1,
      lineTotal: 5.9,
      notes: []
    }
  ]
    const order = await db.submitCart(userId, cartItems )
    req.cart = order
    next()
}

const getUsersLastOrder = async(req, res, next) => {
    const id = Number(req.params.userId)
    req.lastOrder = await db.getUsersLastOrder(id)
    console.log(req.lastOrder)
    next()
}

const deleteLastOrder = async (req, res, next) => {
    await db.deleteLastOrder(Number(req.params.userId))
    next()
}

module.exports = {
    getUserById,
    getAllUsers,
    submitCart,
    getUsersLastOrder,
    deleteLastOrder
}
