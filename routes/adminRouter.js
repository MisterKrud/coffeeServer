const { Router } = require('express');
const router = Router();
const multer = require('multer');
const adminControllers= require("../controllers/adminControllers")
const authControllers = require('../controllers/authControllers')

const storage = multer.memoryStorage()
const upload = multer({storage: storage});

router.use(authControllers.authenticateJWT)
router.use(adminControllers.isAdmin)

router.get('/allUsers', adminControllers.getUserBalances)
router.get('/userBalance', adminControllers.getUserBalance)
router.get('/userTable', adminControllers.getUserTable)
router.get('/orderTable', adminControllers.getOrderTable)
router.get('/orderItemTable', adminControllers.getOrderItemTable)
router.get('/transactionTable', adminControllers.getTransactionTable)
router.get('/userPurchases', adminControllers.getUserPurchases)
router.get('/userTransactions', adminControllers.getTransactionHistory)
// router.get('/userTransactions', adminControllers.getUserTransactions)

router.get('/unmatchedDeposits', adminControllers.getUnmatchedDeposits)
router.get('/', adminControllers.getTodaysOrders)


router.post('/csvFile', upload.single("file"), adminControllers.uploadCsvController)
router.post('/startingBalances', adminControllers.getAllStartingBalances)
router.post('/assignTransactions', adminControllers.assignTransactionToUser)

router.delete('/deleteOrder', adminControllers.removeOrderFromDataBase)


// router.post('/csvFileDebug', upload.single('file'), (req, res) => {
//   console.log('---DEBUG ROUTE HIT---');
//   console.log('req.body:', req.body);
//   console.log('req.file:', req.file);
//   res.json({ status: 'received' });
// });





module.exports = router