
const prisma = require("../lib/prisma.js")
const { startOfDay, endOfDay } = require("date-fns");
const {  utcToZonedTime } = require("date-fns-tz");

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
            id: 'desc',
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
  const newOrder = await prisma.order.create({
    data: {
      userId,
      notes: notes,
      total: total,
      items: {
        create: cartItems.map(item => ({
          itemName: item.productName,
          size: item.size || null,
          milk: item.milk || null,
          syrups: JSON.stringify(item.syrups) || null, // store as JSON
          tea: item.tea || null,
          extras: JSON.stringify(item.extras) || null,
          sauce: item.sauce || null,
          topping: item.topping || null,
          modifiers: JSON.stringify(item.modifiers) || null,
          sugar: item.sugar || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.unitPrice * item.quantity,
         
        }))
      },
    
      
    },
    include: { items: true } // so you can attach to req.cart
  });

  return newOrder;
}

async function getTodaysOrders() {
  const timeZone = 'Australia/Sydney';
  const now = new Date();

  // Get the local Sydney start/end of day
  const localStart = startOfDay(now);
  const localEnd = endOfDay(now);

  // Convert local Sydney times to UTC for querying the DB
  const start = new Date(localStart.getTime() - (localStart.getTimezoneOffset() * 60000));
  const end = new Date(localEnd.getTime() - (localEnd.getTimezoneOffset() * 60000));

  const todaysOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
    include: {
  user: { select: { name: true } },
  items: true,
},

  });

  console.log('Todays orders:', todaysOrders);
  return todaysOrders;
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
    getTodaysOrders
}