
const prisma = require("../lib/prisma.js");
const crypto = require("crypto");
const { startOfDay, endOfDay } = require("date-fns");
const bcrypt = require("bcryptjs")

const {  utcToZonedTime } = require("date-fns-tz");
const {sizeAbbrev, toppingAbbrev, syrupsAbbrev, eggsAbbrev, coffeeAbbrev, foodAbbrev, milkAbbrev, teaAbbrev, modifiersAbbrev, extrasAbbrev} = require("./abbreviationData")

async function createUser(email, name, password){
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.create({
        data: {
            name: name,
            email: normalizedEmail,
            passwordHash: password,
        }
    })
    return user
}

async function updateUserPassword(userId, newPassword) {
    return await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            hashedPassword: newPassword
        }
    })
}

async function getUserByEmail(email){
  const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
        where: {
            email: normalizedEmail
        }
    })
    return user
}

async function getUserById(id) {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })
    return user
}

async function getAllUsers() {
   return await prisma.user.findMany()
  
}
//WHY IS THIS HERE WHEN IT EXISTS SOMEWHERE ELSE?
// async function getUsersLastOrder(userId){
//     const lastOrder = await prisma.order.findFirst({
//         where: {
            
//             userId: userId
//         },
//         orderBy: {
//             id: 'desc',
//         }
//     })

//     const orderItems = await prisma.orderItem.findMany({
//         where: {
//             orderId: lastOrder.id
//         }
//     })
//     return orderItems
// }

async function getAllUserOrders(userId){
    const userOrders = await prisma.order.findMany({
      
       
        where: {
            userId: userId
        },
        orderBy: {
            id: 'asc',
        },
        include: {
            items: true
        }
    })

    return userOrders
}


async function deleteLastOrder(userId){
    const lastOrder = await prisma.order.findFirst({
        where: {
            userId: userId
        },
        orderBy: {
            id: 'asc'
        }
    })

    await prisma.orderItem.deleteMany({
        where: {
            orderId: lastOrder.id
        }
    })

    await prisma.order.delete({
        where: {
            id: lastOrder.id
        }
    })

}






//Helper to get Sydney current time
function getSydneyNow() {
  const now = new Date();

  // Get Sydney time components using Intl.DateTimeFormat
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const y = Number(parts.find(p => p.type === 'year').value);
  const m = Number(parts.find(p => p.type === 'month').value);
  const d = Number(parts.find(p => p.type === 'day').value);
  const h = Number(parts.find(p => p.type === 'hour').value);
  const min = Number(parts.find(p => p.type === 'minute').value);
  const s = Number(parts.find(p => p.type === 'second').value);

  // Construct a valid JS Date in UTC that represents Sydney local time
  return new Date(Date.UTC(y, m - 1, d, h, min, s));
}


async function submitCart(userId, cartItems, total, notes) {
  // Sydney-local timestamp
  const createdAt = getSydneyNow();

  return await prisma.order.create({
    data: {
      user: { connect: { id: userId } },
      notes,
      total,
      createdAt, // explicitly set Sydney-local timestamp
      items: {
        create: cartItems.map(item => {
          const unitPrice = Number(item.unitPrice);
          const quantity = Number(item.quantity);

          if (!unitPrice || !quantity) {
            throw new Error("Invalid cart item");
          }

          return {
            itemName: item.productName,
            productCode: item.productCode,
            size: item.size ?? null,
            milk: item.milk ?? null,
            tea: item.tea ?? null,
            sugar: item.sugar ?? null,
            topping: item.topping ?? null,
            egg: item.eggs ?? null,
            syrups: item.syrups ? JSON.stringify(item.syrups) : null,
            extras: item.extras ? JSON.stringify(item.extras) : null,
            modifiers: item.modifiers ? JSON.stringify(item.modifiers) : null,
            sauce: item.sauce ? JSON.stringify(item.sauce) : null,
            orderedFor: item.orderedFor,
            quantity,
            unitPrice,
            lineTotal: unitPrice * quantity,
          };
        }),
      },
    },
    include: { items: true },
  });
}




function ordersMap(o) {
    return {
    
    id: o.id,
    userName: o.user.name,
    userEmail: o.user.email,
    createdAt: o.createdAt,
    total: o.total,
    notes: o.notes,
    items: o.items.map(i => {
    const syrups = i.syrups ? JSON.parse(i.syrups) : [];
    const modifiers= i.modifiers ? JSON.parse(i.modifiers) : [];
    const extras = i.extras ? JSON.parse(i.extras) : [];
   
    return{
      itemName: i.itemName,
      abbrevName: coffeeAbbrev[i.itemName] || foodAbbrev[i.itemName] || i.itemName,
      size: i.size,
      abbrevSize: sizeAbbrev[i.size] || i.size,
      milk: i.milk,
      abbrevMilk: milkAbbrev[i.milk] || i.milk,
      tea: i.tea,
      abbrevTea: teaAbbrev[i.tea] || i.tea,
      syrups,
      abbrevSyrups: syrups.map(s => syrupsAbbrev[s] ?? s),
      modifiers,
      abbrevModifiers: modifiers.map(m => modifiersAbbrev[m] ?? m),
      extras,
      abbrevExtras: extras.map(ex => extrasAbbrev[ex] ?? ex ),
      eggs: i.eggs,
      abbrevEggs: eggsAbbrev[i.eggs] || i.eggs,
      topping: i.topping,
      abbrevTopping: toppingAbbrev[i.topping] || i.topping,
      sauce: i.sauce ? JSON.parse(i.sauce) : [],
      sugar: i.sugar,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
      orderedFor: i.orderedFor,
    
    }
    })}
}


// db/orders.js



// Utility to get Sydney midnight in UTC for DB query
// Compute Sydney midnight in UTC for queries
// Returns Sydney midnight today
function getSydneyStartOfToday() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const y = parts.find(p => p.type === 'year').value;
  const m = parts.find(p => p.type === 'month').value;
  const d = parts.find(p => p.type === 'day').value;

  return new Date(`${y}-${m}-${d}T00:00:00`);
}


// Get all orders placed today (from Sydney midnight onward)
async function getTodaysOrders() {
  const start = getSydneyStartOfToday();

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start }, // all orders from today
    },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return orders.map(ordersMap);
}

// Get all orders for a specific user placed today
async function getUsersLastOrder(userId) {
  const start = getSydneyStartOfToday();

  const orders = await prisma.order.findMany({
    where: {
      userId,
      createdAt: { gte: start }, // user’s orders from today
    },
    include: {
      user: { select: { name: true } },
      items: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return orders.map(ordersMap);
}


//Reset Password
async function createPasswordResetToken(email) {
  const normalizedEmail = email.trim().toLowerCase();
  console.log('request password reset start')
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

    if (!user) {
    console.log('No such user')
    return null
  };

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });
  console.log('token created')
  return rawToken;
}

async function consumePasswordResetToken(token, newPassword) {
  console.log('consuming token')
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    console.log('No such user')
    return false
  };

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  });
console.log('token consumed')
  return true;
}



module.exports = {
    createUser,
    updateUserPassword,
    getUserById,
    getUserByEmail,
    getAllUsers, 
    submitCart,
    getUsersLastOrder,
    getAllUserOrders,
    deleteLastOrder,
    getTodaysOrders,
    createPasswordResetToken, 
    consumePasswordResetToken
}