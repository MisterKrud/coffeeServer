const { Router } = require('express');
const router = Router();
const passport = require('../config/passport');
const userControllers = require('../controllers/userControllers')

router.get('/', (req, res) => {
    return res.send('success')
})



module.exports = router;