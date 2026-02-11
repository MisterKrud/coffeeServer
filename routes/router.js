const { Router } = require('express');
const router = Router();
const axios = require('axios')
const passport = require('../config/passport');
const userControllers = require('../controllers/userControllers')
const authControllers = require("../controllers/authControllers");
const { order } = require('../lib/prisma');



// router.get("/test-db", async (req, res) => {
//   try {
//     const users = await prisma.user.findMany();
//     res.json({ success: true, count: users.length });
//   } catch (e) {
//     res.status(500).json({ success: false, error: e.message });
//   }
// });


router.get('/health', (req, res) => res.send("Health ok"))

router.get('/todaysOrders',  userControllers.getTodaysOrders);

router.post('/sign-up', authControllers.createUser, authControllers.issueSignupToken)

router.post('/csvFile', (req, res) => res.status(201).json({message: "File received"}))


router.post("/newOrder", authControllers.authenticateJWT, userControllers.submitCart, (req, res) => {


  if (!req.cart) {
    return res.status(400).json({ message: "Order has no items" });
  }
  res.status(201).json(req.cart)
    
  console.log ('submitted order from front end',req.body)
  // validation comes next
});

router.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code");

  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("TOKENS:", response.data);

    res.send("OAuth success — check logs");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Token exchange failed");
  }
});

module.exports = router;