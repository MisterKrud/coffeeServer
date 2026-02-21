require("dotenv").config();
const db = require("../db/queries");
const multer = require('multer');
const Papa = require("papaparse")
const { generateBankFingerPrint } = require('../utils/bankImport');

const { default: next } = require("next");


const isAdmin = async(req, res, next) => {

    console.log('admin status:', req.user)
        if(!req.user) return res.sendStatus(401);
       if (!req.user.isAdmin) return res.sendStatus(403)
            next()
    }



const getAllUsers= async(req, res, next) => {
   try{ const allUsers = await db.getAllUsers();
    req.allUsers = allUsers;
    console.log('all users', allUsers)
     res.json(allUsers)
    next()
   } catch(err) {
    next(err)
   }
}


const getTodaysOrders = async(req, res, next) => {
   try{
    const todaysOrders = await db.getTodaysOrders()
    console.log(todaysOrders)
   req.todaysOrders =   todaysOrders
   console.log(req.todaysOrders)
    res.json(todaysOrders)
    next()
   }
   catch(err){
   next(err)
   }
}


const getAllStartingBalances = async(req, res, next) => {
    try{
        const userBalances = await db.addAllStartingBalances()
        console.log('getting balances')
       
        next();
    }
    catch(err){
        next(err)
    }
}





const uploadCsvController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const csvString = req.file.buffer.toString("utf-8");

    const results = Papa.parse(csvString, {
      header: false,
      skipEmptyLines: true,
    });

    const rows = results.data;

    // Only transfer rows
    const tfRows = rows.filter(r => r[2]?.startsWith("TFR From"));

    // Validate positive deposits
    const validRows = tfRows.filter(r => {
      const amt = parseFloat(r[4]);
      return !isNaN(amt) && amt > 0;
    });

    // Prepare transactions (NO userId assignment here)
    const transactionsToInsert = validRows.map(r => {
      const date = r[0];
      const details = r[2];
      const amount = parseFloat(r[4]);

      return {
        userId: null, // always null initially
        orderId: null,
        type: "deposit",
        amount: Math.round(amount * 100),
        source: "bank",
        rawDescription: details,
        createdAt: new Date(date),
        bankFingerprint: generateBankFingerPrint({
          date,
          details,
          amount
        })
      };
    });

    // Insert transactions
    await db.insertTransactions(transactionsToInsert);

    // 🔥 NEW: Auto-assign using substring matching
    const mappings = await db.mapBankNames();
   console.log('running auto assignment')
    for (const mapping of mappings) {
     
     await db.updateTransactionRecords(mapping)
      console.log(`Mapping "${mapping.bankName}" updated ${results.count} rows`);
    }

    res.json({ insertedCount: transactionsToInsert.length });

  } catch (err) {
    next(err);
  }
};



const assignTransactionToUser = async (req, res, next) => {
  try {
    const { transactionId, userId, bankName } = req.body;
    console.log(transactionId, userId, bankName)
    if (!transactionId || !userId || !bankName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedTransaction = await db.assignTransactionToUser(transactionId, userId, bankName);

    res.json(updatedTransaction);
  } catch (err) {
    next(err);
  }
};



const getUnmatchedDeposits = async(req, res, next) => {
    try{
    const deposits = await db.getUnmatchedDeposits();
    res.json(deposits)
    } catch(err) {
        next(err)
    }
}

const getUserTransactions =  async(req, res, next) => {
    const {userId} = req.query
    const userTransactions = await db.getUserTransactions(userId);
    res.json(userTransactions);
    next()
}

const getUserBalance = async (req, res, next) => {
    try{
         const {userId} = req.query
      const balance =  await db.getUserBalance(Number(userId))
      console.log(balance)
        res.json(balance)
    } catch(err){
        next(err)
    }
}

const getUserBalances = async (req, res, next) => {
    const userBalances = await db.getUserBalances()
    console.log('user balances', userBalances)
    res.json(userBalances)
    next()
}


const getUserTable = async (req, res, next) => {
    try{
    const userTable = await db.getUserTable()
    res.json(userTable)

    } catch(err){
        next(err)
    }
}

const getOrderTable = async (req, res, next) => {
    try{
    const orderTable = await db.getOrderTable()
    res.json(orderTable)

    } catch(err){
        next(err)
    }
}

const getOrderItemTable = async (req, res, next) => {
    try{
    const orderItemTable = await db.getOrderItemsTable()
    res.json(orderItemTable)

    } catch(err){
        next(err)
    }
}

const getTransactionTable = async (req, res, next) => {
    try{
    const transactionTable = await db.getTransactionsTable()
    res.json(transactionTable)

    } catch(err){
        next(err)
    }
}

const getUserPurchases = async (req, res, next) => {
    try{
    const userPurchasesTable = await db.getUserPurchases()
    res.json(userPurchasesTable)

    } catch(err){
        next(err)
    }
}



module.exports = {
    getAllUsers,
    getTodaysOrders,
    uploadCsvController,
    getAllStartingBalances,
    assignTransactionToUser,
    getUnmatchedDeposits,
    getUserTransactions,
    getUserBalance,
    getUserBalances,
    getUserTable,
    getOrderTable,
    getOrderItemTable,
    getTransactionTable,
    getUserPurchases,
    isAdmin
}