import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authenticateToken } from './middleware.js'

const prisma = new PrismaClient().$extends(withAccelerate())

const app = express()
app.use(express.json())

app.get('/users', authenticateToken, async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})




app.post('/register', async (req, res) => {
  const user = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
    },
  })
  const { password, ...userwithoutpassword } = user
  res.json(userwithoutpassword)
})

app.post('/login', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  })
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }
  const isValid = await bcrypt.compare(req.body.password, user.password)
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }
  const { password, ...userwithoutpassword } = user

  const token = jwt.sign({ userId: user.id, userName: user.name }, process.env.JWT_SECRET)

  res.json({ ...userwithoutpassword, token })
})

app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
💾 Prisma Client version: ${prisma._clientVersion}
`),
)