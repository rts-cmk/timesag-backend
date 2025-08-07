import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import express from 'express'
import router from './router.js'




const prisma = new PrismaClient().$extends(withAccelerate())

const app = express()
app.use(express.json())
app.use(router)
















app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
💾 Prisma Client version: ${prisma._clientVersion}
`),
)