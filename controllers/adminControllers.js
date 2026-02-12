require("dotenv").config();
const db = require("../db/queries");
const multer = require('multer');
const Papa = require("papaparse")
const { generateBankFingerPrint } = require('../utils/bankImport')





const getTodaysOrders = async(req, res, next) => {
   try{
    const todaysOrders = await db.getTodaysOrders()
    console.log(todaysOrders)
   req.todaysOrders =   todaysOrders
   console.log(req.todaysOrders)
    res.render('/', {
        orders: req.todaysOrders
    })
    next()
   }
   catch(err){
   next(err)
   }
}





const uploadCsvController = async (req, res, next) => {
    try {
        console.log('---CSV Upload Controller Hit---');

        if (!req.file) {
            console.warn('No file uploaded');
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Convert file buffer to string
        const csvString = req.file.buffer.toString('utf-8');
        console.log('CSV string length:', csvString.length);

        // Parse CSV
        const results = Papa.parse(csvString, {
            header: false,
            skipEmptyLines: true
        });

        const rows = results.data;
        console.log('Total rows parsed:', rows.length);
        rows.forEach((r, i) => console.log(`Row ${i}:`, r));
        const tfRows = rows.filter( r=> r[2]?.startsWith('TFR From'))

        // Filter for positive amounts (deposits)
        const transactionsToInsert = tfRows
            .filter(r => {
                const amt = parseFloat(r[4]);
                if (isNaN(amt)) {
                    console.warn('Skipping row with invalid amount:', r);
                    return false;
                }
                return amt > 0;
            })
            .map(r => {
                const date = r[0];
                const details = r[2];
                const amount = parseFloat(r[4]);

                const bankFingerprint = generateBankFingerPrint({
                    date,
                    details,
                    amount
                });

                return {
                    userId: null,
                    orderId: null,
                    type: "deposit",
                    amount: Math.round(amount * 100),
                    source: "bank",
                    rawDescription: details,
                    createdAt: new Date(date),
                    bankFingerprint
                };
            });

        console.log('Transactions to insert:', transactionsToInsert);

        // Insert into DB
        const inserted = await db.insertTransactions(transactionsToInsert);
        console.log('Inserted result:', inserted);

        res.json({ insertedCount: inserted.count });

    } catch (err) {
        console.error('Error in uploadCsvController:', err);
        next(err);
    }
};



module.exports = {
    getTodaysOrders,
    uploadCsvController
}