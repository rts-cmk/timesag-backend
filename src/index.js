
import express from 'express'
import router from './router.js'
import prisma from './config/prismaClient.js'
import cors from 'cors'



const app = express()

app.use(express.json())
app.use(cors())


app.use(router)
















app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
💾 Prisma Client version: ${prisma._clientVersion}
`),
)