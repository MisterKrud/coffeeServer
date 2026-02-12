require("dotenv").config();
const passport = require('passport');
const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const jwt = require('jsonwebtoken');
const { body, validationResult, matchedData } = require("express-validator");
const { sendResetEmail } = require('../utils/email.js')


const userValidator = [
  body("name").trim().notEmpty(),
  body("email").trim().isEmail().customSanitizer((email) => email.toLowerCase()),
   body("password").trim().isLength({ min: 5 })
];


const createUser = [
  userValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newUser = matchedData(req);

      const hashedPassword = await bcrypt.hash(newUser.password, 10);

      const user = await db.createUser(
        newUser.email,
        newUser.name,
        hashedPassword
      );

      // ✅ explicitly set for next middleware
      req.user = user;

      return next();
    } catch (err) {
      console.error("SIGNUP CREATE USER ERROR:", err);
      return res.status(500).json({ error: "Failed to create user" });
    }
  },
];

const issueSignupToken = (req, res) => {
  if (!req.user) {
    console.error("SIGNUP TOKEN ERROR: req.user missing");
    return res.status(500).json({ error: "User creation failed" });
  }

  const token = jwt.sign(
    { id: req.user.id, email: req.user.email },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.status(201).json({
    token,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    },
  });
};



const authenticateUser = (req, res, next) => {
     passport.authenticate("local", (err, user, info) => {
    if(err) return next(err)
        if(!user){
       const err = new Error('Unauthorized');
  err.status = 401;
  return next(err);
        }

   const token = jwt.sign(
    {id: user.id, email: user.email},
    process.env.JWT_SECRET,
    { expiresIn: '30d'}
   );

   return res.json({
    token,
    
    user: {id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin},
   });




})(req, res, next)
}

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.sendStatus(401)

  const token = authHeader.split(' ')[1]
console.log("AUTH HEADER:", authHeader);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
    const authError = new Error('Forbidden: Invalid token');
    authError.status = 403;
    return next(authError);
  }

  req.user = user;
  console.log('logged user: ', req.user)
  next();
  })
}


const  requestPasswordReset = async(req, res) => {
  const { email } = req.body;

  const response = {
    message: "A reset link has been sent to you email.\n\nYou may need to check your junk folder",
  };
  if (!email) return res.status(200).json(response);

  const token = await db.createPasswordResetToken(email);

  if (token) {
    await sendResetEmail(email, token)
  }

  return res.status(200).json(response)

}

async function confirmPasswordReset(req, res) {
  const { token, newPassword } = req.body;
  console.log('recieved password stuff:', req.body)

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const success = await db.consumePasswordResetToken(token, newPassword);

  if (!success) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  return res.status(200).json({ message: "Password reset successful" });
}



module.exports = {
    authenticateUser, 
    createUser,
   authenticateJWT,
   issueSignupToken,
   requestPasswordReset,
   confirmPasswordReset
}