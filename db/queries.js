
const prisma = require("../lib/prisma.js")
const { startOfDay, endOfDay } = require("date-fns");
const {  utcToZonedTime } = require("date-fns-tz");
const {sizeAbbrev, toppingAbbrev, syrupsAbbrev, eggsAbbrev, coffeeAbbrev, foodAbbrev, milkAbbrev, teaAbbrev, modifiersAbbrev, extrasAbbrev} = require("./abbreviationData")

async function createUser(email, name, password){
    const user = await prisma.user.create({
        data: {
            name: name,
            email: email,
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
    const user = await prisma.user.findUnique({
        where: {
            email: email
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

async function getUsersLastOrder(userId){
    const lastOrder = await prisma.order.findFirst({
        where: {
            
            userId: userId
        },
        orderBy: {
            id: 'desc',
        }
    })

    const orderItems = await prisma.orderItem.findMany({
        where: {
            orderId: lastOrder.id
        }
    })
    return orderItems
}

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

async function updateUserPassword(userId, newPassword){
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            password: newPassword
        }
    })
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



//VERSION NEEDS TO CHANGE FOR TMIESTAMP CREATION

// async function submitCart(userId, cartItems, total, notes) {
//   return await prisma.order.create({
//     data: {
//       userId,
//       notes,
//       total,
//       items: {
//         create: cartItems.map(item => {
//           const unitPrice = Number(item.unitPrice);
//           const quantity = Number(item.quantity);

//           if (!unitPrice || !quantity) {
//             throw new Error("Invalid cart item");
//           }

//           return {
//             itemName: item.productName,
//             size: item.size ?? null,
//             milk: item.milk ?? null,
//             tea: item.tea ?? null,
//             sugar: item.sugar ?? null,
//             topping: item.topping ?? null,
//             egg: item.eggs ?? null,

//             syrups: item.syrups ? JSON.stringify(item.syrups) : null,
//             extras: item.extras ? JSON.stringify(item.extras) : null,
//             modifiers: item.modifiers ? JSON.stringify(item.modifiers) : null,
//             sauce: item.sauce ? JSON.stringify(item.sauce) : null,
//             orderedFor: item.orderedFor,
//             quantity,
//             unitPrice,
//             lineTotal: unitPrice * quantity,
//           };
//         }),
//       },
//     },
//     include: { items: true },
//   });
// }


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

// function getSydneyTodayRange() {
//   const timeZone = 'Australia/Sydney';

//   const now = new Date();

//   // Get Sydney calendar date safely
//   const parts = new Intl.DateTimeFormat('en-CA', {
//     timeZone,
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//   }).formatToParts(now);

//   const get = (type) => parts.find(p => p.type === type)?.value;

//   const year = get('year');
//   const month = get('month');
//   const day = get('day');

//   if (!year || !month || !day) {
//     throw new Error('Failed to determine Sydney date');
//   }

//   // Construct Sydney-local midnights
//   const sydneyStartLocal = `${year}-${month}-${day}T00:00:00`;
//   const sydneyEndLocal   = `${year}-${month}-${day}T24:00:00`;

//   // Convert Sydney local time → UTC Date
//   const start = new Date(
//     new Date(sydneyStartLocal)
//       .toLocaleString('en-US', { timeZone })
//   );

//   const end = new Date(
//     new Date(sydneyEndLocal)
//       .toLocaleString('en-US', { timeZone })
//   );

//   return { start, end };
// }




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




//Sydney time for logging
// function getSydneyNow() {
//   const now = new Date();
//   const sydneyString = now.toLocaleString('en-AU', { 
//     timeZone: 'Australia/Sydney', 
//     hour12: false 
//   });
//   return new Date(sydneyString);
// }


// async function getTodaysOrders() {
//   const timeZone = 'Australia/Sydney';

//   const now = new Date();

//   // Convert "now" to Sydney time
//   const sydneyNow = toZonedTime(now, timeZone);

//   // Get start/end of Sydney day
//   const sydneyStart = startOfDay(sydneyNow);
//   const sydneyEnd = endOfDay(sydneyNow);

//   // Convert back to UTC for Prisma
//   const start = new Date(sydneyStart.toISOString());
//   const end = new Date(sydneyEnd.toISOString());

//   const orders = await prisma.order.findMany({
//     where: {
//       createdAt: {
//         gte: start,
//         lte: end,
//       },
//     },
//     include: {
//       user: { select: { name: true } },
//       items: true,
//     },
//     orderBy: { createdAt: 'asc' },
//   });

//   return orders.map(o => ({
//     id: o.id,
//     userName: o.user.name,
//     createdAt: o.createdAt,
//     total: o.total,
//     items: o.items.map(i => ({
//       itemName: i.itemName,
//       size: i.size,
//       milk: i.milk,
//       tea: i.tea,
//       syrups: i.syrups ? JSON.parse(i.syrups) : [],
//       modifiers: i.modifiers ? JSON.parse(i.modifiers) : [],
//       extras: i.extras ? JSON.parse(i.extras) : [],
//       topping: i.topping,
//       sauce: i.sauce ? JSON.parse(i.sauce) : [],
//       sugar: i.sugar,
//       quantity: i.quantity,
//       unitPrice: Number(i.unitPrice),
//       lineTotal: Number(i.lineTotal),
//     })),
//   }));
// }


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
    updateUserPassword
}