// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
      passwordHash: 'hashedpassword1', // replace with proper hash
      orders: {
        create: [
          {
            total: 7.50,
            notes: 'Morning coffee',
            items: {
              create: [
                {
                  itemName: 'Flat White',
                  orderedFor: 'Alice',
                  size: 'Medium',
                  milk: 'Oat',
                  unitPrice: 4.50,
                  quantity: 1,
                  lineTotal: 4.50,
                },
                {
                  itemName: 'Croissant',
                  orderedFor: 'Alice',
                  unitPrice: 3.00,
                  quantity: 1,
                  lineTotal: 3.00,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob',
      passwordHash: 'hashedpassword2', // replace with proper hash
      orders: {
        create: [
          {
            total: 5.50,
            notes: 'Extra sugar',
            items: {
              create: [
                {
                  itemName: 'Latte',
                  orderedFor: 'Bob',
                  size: 'Large',
                  milk: 'Full Cream',
                  sugar: 2,
                  unitPrice: 5.50,
                  quantity: 1,
                  lineTotal: 5.50,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
