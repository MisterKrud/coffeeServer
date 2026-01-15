require("dotenv").config();
const passport = require('passport');
const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const jwt = require('jsonwebtoken');
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
    { expiresIn: '1hr'}
   );

   return res.json({
    token,
    
    user: {id: user.id, email: user.email, name: user.name},
   });




})(req, res, next)
}

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.sendStatus(401)

  const token = authHeader.split(' ')[1]

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
    const authError = new Error('Forbidden: Invalid token');
    authError.status = 403;
    return next(authError);
  }

  req.user = user;
  next();
  })
}


module.exports = {
    authenticateUser, 
    createUser,
   authenticateJWT,
}