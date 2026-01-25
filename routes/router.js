const { Router } = require('express');
const router = Router();
const passport = require('../config/passport');
const userControllers = require('../controllers/userControllers')
const authControllers = require("../controllers/authControllers");
const { order } = require('../lib/prisma');

router.get('/', (req, res) => {
    return res.send('success')
})

router.get("/test-db", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ success: true, count: users.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});


router.get('/health', (req, res) => res.send("Health ok"))

router.get('/todaysOrders',  userControllers.getTodaysOrders);

router.post('/sign-up', userControllers.createUser, authControllers.issueSignupToken)


router.post("/newOrder", authControllers.authenticateJWT, userControllers.submitCart, (req, res) => {


  if (!req.cart) {
    return res.status(400).json({ message: "Order has no items" });
  }
  res.status(201).json(req.cart)
    
  console.log ('submitted order from front end',req.body)
  // validation comes next
});

module.exports = router;