require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");

const userValidator = [
  body("name").trim(),
  body("email").trim(),
  body("password")
    .trim()
    .isAlphanumeric()
    .withMessage("Password must be alphanumeric"),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match"),
];


const createUser = [
    userValidator, async(req, res, next) => {
 const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("index", {
        errors: errors.array(),
      });
    }

    const newUser = matchedData(req)
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const user = await db.createUser(newUser.email, newUser.name, hashedPassword)
    req.user = await db.getUserById(user.id)

    next()
}
]




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
    const cartItems =  [
    {
      itemName: 'Flat White',
      size: 'Large',
      unitPrice: 6.1,
      quantity: 1,
      lineTotal: 6.1,
      notes: ['Skim milk', 'Extra hot']
    },
    {
      itemName: 'Chai Latte',
      size: 'Small',
      unitPrice: 5.7,
      quantity: 1,
      lineTotal: 5.7,
      notes: []
    }
  ]
    const order = await db.submitCart(userId, cartItems )
    req.cart = order
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

module.exports = {
    createUser,
    getUserById,
    getAllUsers,
    submitCart,
    getUsersLastOrder,
    deleteLastOrder,
    getAllUserOrders
}
