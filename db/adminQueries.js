const prisma = require("../lib/prisma.js");
const { queries } = require("./queries.js");



async function getAllUsers() {
  return await prisma.user.findMany();
}

async function getUnmatchedDeposits() {
  return await prisma.transactionRecord.findMany({
    where: {
      type: "deposit",
      userId: null,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function updateTransactionRecords(mapping) {
  await prisma.transactionRecord.updateMany({
    where: {
      userId: null,
      type: "deposit",
      rawDescription: {
        contains: mapping.bankName,
        mode: "insensitive", // important for Postgres
      },
    },
    data: {
      userId: mapping.userId,
    },
  });
}

async function mapBankNames() {
  // async function mapBankNames(bankNames){
  return await prisma.bankNameMapping.findMany({
    // where: { bankName: { in: bankNames } }
  });
}

async function addAllStartingBalances() {
  // const users = await prisma.user.findMany({ select: { id: true } });

  const users = await prisma.user.findMany();
  for (const user of users) {
    const balance = await getUserBalance(user.id); // safe: returns 0 if no orders
    if (balance === 0) continue; // optional: skip zero balances

    await prisma.transactionRecord.create({
      data: {
        userId: user.id,
        amount: balance,
        type: "starting balance",
        source: "manual",
        createdAt: new Date(),
      },
    });
  }

  console.log("All starting balances added.");
}

async function insertTransactions(transactions) {
  const insertedTransactions = await prisma.transactionRecord.createMany({
    data: transactions,
    skipDuplicates: true,
  });

  return insertedTransactions;
}

async function assignTransactionToUser(transactionId, userId, bankName) {
  // Upsert mapping so duplicates don’t break things
  console.log("assignTransaction params", transactionId, userId, bankName);
  console.log(typeof userId, typeof transactionId);
  await prisma.bankNameMapping.upsert({
    where: { bankName }, // unique constraint on bankName
    update: { userId }, // if exists, update userId (rare case)
    create: { bankName, userId }, // if not exists, create
  });

  // Assign the transaction to the user
  return await prisma.transactionRecord.update({
    where: { id: transactionId },
    data: { userId },
  });
}

async function getTransactionHistory(userId, startDate, endDate){
    const orders =  await prisma.order.findMany({
        where: {
            userId: userId ? Number(userId) : undefined,
            createdAt: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined
            },
        },
        include: {
            user: true,
            items: true,
        },
        orderBy: {createdAt: 'desc'}
    });
    const groupByDate = orders.reduce((acc, order) => {
        const dateKey = order.createdAt.toISOString().split('T')[0];
          if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(order);

    return acc;
    }, {});
    return groupByDate
}
async function removeOrderFromDataBase(orderId) {
  return await prisma.$transaction([
    prisma.orderItem.deleteMany({
      where: { orderId: Number(orderId) }
    }),
    prisma.order.delete({
      where: { id: Number(orderId) }
    })
  ]);
}




async function getUserBalances() {
  return await prisma.$queryRaw`
    SELECT u.id,
           u.name,
           u.email,
           SUM(t.amount)::INT AS balance
    FROM "User" u
    JOIN "TransactionRecord" t
      ON u.id = t."userId"
    GROUP BY u.id, u.name, u.email
    ORDER BY u.name ASC
  `;
}

async function getUserTable() {
  return await prisma.$queryRaw`
  SELECT * FROM "User"`;
}

async function getOrderItemsTable() {
  return await prisma.$queryRaw`
  SELECT * FROM "OrderItem"`;
}

async function getOrderTable() {
  return await prisma.$queryRaw`
  SELECT * FROM "Order"`;
}

async function getOrderItemsTable() {
  return await prisma.$queryRaw`
  SELECT * FROM "OrderItem"`;
}

async function getTransactionsTable() {
  return await prisma.$queryRaw`
  SELECT * FROM "TransactionRecord"
  WHERE "type" = 'deposit'
  ORDER BY "createdAt" DESC LIMIT 1`;
}

async function getUserPurchases() {
  return await prisma.$queryRaw`
    SELECT  u.id as id,
            u.name as username,
            u.email as email,
            o."createdAt" as "createdAt",
            o.total as total,
            o.id as "orderId",
            oi.id as "itemId",
            oi."itemName" as item
    FROM "User" u
    JOIN "Order" o ON o."userId" = u.id
    JOIN "OrderItem" oi ON o.id = oi."orderId"
    
    ORDER BY o."createdAt"
  `;
}


//probably not needed
async function getUserTransactionHistory(usersid) {
  return await prisma.$queryRaw`
    SELECT  u.id as "userId",
            u.name as username,
            u.email as email,
            t.type as "transactionType",
            t.amount as amount,
            t."createdAt" as timedate
    FROM "User" u
    JOIN "TransactionRecord" t 
      ON u.id = t."userId"
    WHERE u.id = ${usersid}
    ORDER BY t."createdAt"
  `;
}

module.exports = {
  getAllUsers, //
  getUnmatchedDeposits,
  addAllStartingBalances,
  insertTransactions,
  updateTransactionRecords,
  assignTransactionToUser,
  mapBankNames,
  getUserTable,
  getOrderTable,
  getOrderItemsTable,
  getTransactionsTable,
  getUserPurchases,
  getUserBalances,
 getUserTransactionHistory,
  getTransactionHistory,
  removeOrderFromDataBase,
 
};
