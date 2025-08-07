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
}