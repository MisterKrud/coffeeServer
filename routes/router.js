const { Router } = require('express');
const router = Router();
const passport = require('../config/passport');
const userControllers = require('../controllers/userControllers')
const authControllers = require("../controllers/authControllers");
const { order } = require('../lib/prisma');

router.get('/', (req, res) => {
    return res.send('success')
})

// router.post("/newOrder", authControllers.authenticateJWT, userControllers.submitCart, async (req, res) => {
//   const { items, total } = req.body;

//   if (!Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ message: "Order has no items" });
//   }
//   console.log ('submitted order from front end',req.body)
//   // validation comes next
// });

router.get('/todaysOrders', authControllers.authenticateJWT, userControllers.getTodaysOrders);



router.post("/newOrder", authControllers.authenticateJWT, userControllers.submitCart, (req, res) => {


  if (!req.cart) {
    return res.status(400).json({ message: "Order has no items" });
  }
  res.status(201).json(req.cart)
    
  console.log ('submitted order from front end',req.body)
  // validation comes next
});

module.exports = router;