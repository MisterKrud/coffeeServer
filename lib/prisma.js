// require('dotenv').config();
// const { PrismaPg } = require('@prisma/adapter-pg');
// const { PrismaClient } = require('../generated/prisma/client.js');

// const connectionString = `${process.env.DATABASE_URL}`

// const adapter = new PrismaPg({ connectionString })
// const prisma = new PrismaClient({ adapter })

// module.exports = prisma;

import "dotenv/config";

import { PrismaPg } from '@prisma/adapter-pg'
//DEV??
// import { PrismaClient } from '../generated/prisma/client.js'

//PROD??
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })

//DEV?
// const prisma = new PrismaClient({ adapter })

//DEV?
// export { prisma }

//PROD?
export const prisma = new PrismaClient()