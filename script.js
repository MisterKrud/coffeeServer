const  prisma  = require('./lib/prisma')

async function main() {
    const user = await prisma.user.create({
        data: {
            name: 'Allyn',
            email: 'allyn.m.smith@gmail.com',
            passwordHash: 'password'
        }
    })

    const newOrder = await prisma.order.create({
        data: {
            userId: user.id,
            total: 12.90,
            items:{
                create: [{
            
                    itemName: 'Flat white',
                    size: 'Medium',
                    unitPrice: 5.80,
                    lineTotal: 5.80,
                },
                {
               
                    itemName: 'Latte',
                    size: 'Large',
                    unitPrice: 6.10,
                    lineTotal: 6.10,
                }]
                
            }
        }
    })
    console.log('User:', user)
    console.log('Creating order:', newOrder)
}

main()
.then(async () => {
    await prisma.$disconnect()
})
.catch(async (e) => {
    console.error(e)

await prisma.$disconnect()
process.exit(1)})