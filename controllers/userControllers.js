require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");



const updateUserPassword = async (req, res, next) => {
    const user = Number(req.user);
    const newHashedPassword = await bcrypt.hash(user.newPassword, 10);
    const updatedUser = await db.updateUserPassword(user.id, newHashedPassword)
    next()

}


const getUserById = async (req, res, next) => {
    try{
    const id = Number(req.user.id);
    const user = await db.getUserById(id)
    if(!user){
        const error = new Error('User not found');
        error.status = 404
        return next(error)
    }
    req.targetUser = user;
   next()
} catch (err) {
    next(err)
}
}

const getAllUsers = async (req, res, next) => {
    try{
   const allUsers = await db.getAllUsers();

    return res.send(allUsers)
} catch (err){
    next(err)
}
}


const submitCart = async (req, res, next) => {
    try{
    const userId = Number(req.user.id)
    const { items, total, notes } =  req.body
    console.log('items, total',req.body)
    if (!Array.isArray(items) || items.length === 0) {
      const err = new Error("Cart is empty");
      err.status = 400;
      console.error(err)
      return next(err);
    }
    const order = await db.submitCart(userId, items, total, notes )
    req.cart = order
    console.log('order', req.cart)
    next()
} catch(err) {
    next(err)
}
}

const getUsersLastOrder = async(req, res, next) => {
    try{
    const id = Number(req.user.id)
    const  lastOrder = await db.getUsersLastOrder(id)
    if(!lastOrder){
        const error = new Error('Order not found')
        error.status = 404
        return next(error)
    }
        req.lastOrder = lastOrder
    next()
    } catch(err){
        next(err)
    }
}

const getAllUserOrders = async (req, res, next) => {
    try{
    const id = Number(req.user.id)
    const userOrders = await db.getAllUserOrders(id)
    if(!userOrders){
        const error = new Error('Not found')
        error.status = 404
        return next(error)
    }
    req.userOrders = userOrders
    next()
    } catch(err){
        next(err)
    }
}

const deleteLastOrder = async (req, res, next) => {
    try{
    await db.deleteLastOrder(Number(req.user.id))
    next()
    } catch(err){
        next(err)
    }
}

const getTodaysOrders = async (req, res, next) => {
  try {
    const orders = await db.getTodaysOrders();
    console.log('orders', orders)
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

const getUserBalance = async (req, res, next) => {
    try{
      const balance =  await db.getUserBalance(Number(req.user.id))
      console.log(balance)
        res.json(balance)
    } catch(err){
        next(err)
    }
}


module.exports = {
 
    getUserById,
    getAllUsers,
    submitCart,
    getUsersLastOrder,
    deleteLastOrder,
    getAllUserOrders,
    getTodaysOrders,
    getUserBalance
}
