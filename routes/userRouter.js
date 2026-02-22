require("dotenv").config();
const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const db = require("../db/queries");
const passport = require("../config/passport");
const userControllers = require("../controllers/userControllers");
const authControllers = require("../controllers/authControllers");
const { appendFile } = require("node:fs");

router.use(authControllers.authenticateJWT);

router.get("/", userControllers.getUserById, (req, res) => {
  return res.send(req.targetUser);
});

router.get("/lastOrder", userControllers.getUsersLastOrder, (req, res) => {
  return res.json(req.lastOrder);
});

router.get("/allOrders", userControllers.getAllUserOrders, (req, res) => {
  return res.json(req.userOrders);
});

router.get("/userBalance", userControllers.getUserBalance);
router.get("/userTransactions", userControllers.getUserTransactionHistory);


router.post("/newOrder", userControllers.submitCart, async (req, res) => {
  const { items, total } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order has no items" });
  }
});

router.post("/newOrder", userControllers.submitCart, (req, res) => {
  return res.send(req.cart);
});

router.delete(
  "/deleteLastOrder",
  userControllers.deleteLastOrder,
  (req, res) => {
    return res.json(req.lastOrder);
  },
);

// Probably never use this
// router.put('/updatePassword', authControllers.authenticateJWT, userControllers.updatePassword, (req, res) => {
//     return res.json(req.user)
// })

module.exports = router;
