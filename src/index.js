import express from 'express'
import router from './router.js'
import prisma from './config/prismaClient.js'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10000kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(router)

app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
💾 Prisma Client version: ${prisma._clientVersion}
`),
)