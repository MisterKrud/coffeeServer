const { Router } = require('express');
const router = Router();
const multer = require('multer');
const adminControllers= require("../controllers/adminControllers")



const storage = multer.memoryStorage()
const upload = multer({storage: storage});


router.get('/allUsers', adminControllers.getAllUsers)
router.post('/csvFile', upload.single("file"), adminControllers.uploadCsvController)

router.post('/csvFileDebug', upload.single('file'), (req, res) => {
  console.log('---DEBUG ROUTE HIT---');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  res.json({ status: 'received' });
});


router.post('/startingBalances', adminControllers.getAllStartingBalances)

router.get('/', 
  adminControllers.getTodaysOrders,

  (req, res) => {
    res.json(req.todaysOrders)
})


router.get('/unmatchedDeposits', adminControllers.getUnmatchedDeposits)

router.post('/assignTransactions', adminControllers.assignTransactionToUser)

module.exports = router