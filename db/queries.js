const prisma = require("../lib/prisma.js")

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

async function submitCart(userId, cartItems, total) {
  const newOrder = await prisma.order.create({
    data: {
      userId,
      total: total,
      items: {
        create: cartItems.map(item => ({
          itemName: item.productName,
          size: item.size || null,
          milk: item.milk,
          syrups: JSON.stringify(item.syrups), // store as JSON
          modifiers: JSON.stringify(item.modifiers),
          sugar: item.sugar,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.unitPrice * item.quantity,
          notes: item.notes?.join(", ") || null
        }))
      },
      
    },
    include: { items: true } // so you can attach to req.cart
  });

  return newOrder;
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
    deleteLastOrder
}