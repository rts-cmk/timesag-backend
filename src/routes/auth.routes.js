import prisma from '../config/prismaClient.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default function(router) {
    router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
  try {
    // Debug logging
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        received: { email: req.body.email, password: req.body.password }
      });
    }

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

    const token = jwt.sign({ userId: user.id, userName: user.name }, process.env.JWT_SECRET, { expiresIn: '8h' })

    res.json({ ...userwithoutpassword, token })
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
})
}