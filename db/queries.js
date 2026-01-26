
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





async function submitCart(userId, cartItems, total, notes) {
  return await prisma.order.create({
    data: {
      userId,
      notes,
      total,
      items: {
        create: cartItems.map(item => {
          const unitPrice = Number(item.unitPrice);
          const quantity = Number(item.quantity);

          if (!unitPrice || !quantity) {
            throw new Error("Invalid cart item");
          }

          return {
            itemName: item.productName,
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


function getSydneyTodayRange() {
  const now = new Date();

  // Sydney is UTC+10 or +11 (DST)
  // We can detect DST automatically
  const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
  const isDST = Math.min(jan, jul) !== now.getTimezoneOffset();

  const offsetHours = isDST ? 11 : 10;

  const utcMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));

  const start = new Date(utcMidnight.getTime() - offsetHours * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
}


function ordersMap(o) {
    return {
    
    id: o.id,
    userName: o.user.name,
    userEmail: o.user.email,
    createdAt: o.createdAt,
    total: o.total,
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
      orderedFor: i.orderedFor
    }
    })}
}


// db/orders.js
//
async function getTodaysOrders() {

const { start, end } = getSydneyTodayRange();

const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
      items: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return orders.map(ordersMap)
  
}

async function getUsersLastOrder(userId){
    const { start, end } = getSydneyTodayRange();
    const orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: start,
                lte: end,
            },

            userId: userId,
        },
        include: {
            user: {
                select: {name: true}
            },
             items: true,
        },
        orderBy: {createdAt: 'asc'}
       
    })
    return orders.map(ordersMap)
}





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