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

async function deleteLastOrder(userId){
    const lastOrder = await prisma.order.findFirst({
        where: {
            userId: userId
        },
        orderBy: {
            id: 'desc'
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

async function submitCart(userId, cartItems) {
  // cartItems: array of objects, each with item details + modifiers
  // Example structure:
//   [
//     {
//       itemName: 'Flat White',
//       size: 'Medium',
//       unitPrice: 5.8,
//       quantity: 1,
//       lineTotal: 5.8,
//       notes: ['Skim milk', 'Extra hot']
//     },
//     {
//       itemName: 'Ham & Cheese Croissant',
//       unitPrice: 4.5,
//       quantity: 1,
//       lineTotal: 4.5,
//       notes: ['No mustard']
//     }
//   ]

  const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0)

  const newOrder = await prisma.order.create({
    data: {
      userId: userId,
      total: total,
      items: {
        create: cartItems.map(item => ({
          itemName: item.itemName,
          size: item.size || null,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
          notes: item.notes?.join(', ') || null // store modifiers/notes as comma-separated string
        }))
      }
    }
  })

  return newOrder
}

module.exports = {
    getUserById,
    getUserByEmail,
    getAllUsers, 
    submitCart,
    getUsersLastOrder,
    deleteLastOrder
}