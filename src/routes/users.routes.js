import prisma from '../config/prismaClient.js'
import { authenticateToken } from '../middleware.js'

export default function (router) {
    router.get('/users', authenticateToken, async (req, res) => {
        const users = await prisma.user.findMany()
        const usersWithoutPassword = users.map(user => {
            const { password, ...userWithoutPassword } = user
            return userWithoutPassword
        })
        res.json(usersWithoutPassword)
    })

    router.get('/users/:id', authenticateToken, async (req, res) => {
        const user = await prisma.user.findUnique(
            {
                where: { id: req.params.id },
            }
        )
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const { password, ...userwithoutpassword } = user || {}
        res.json(userwithoutpassword)
    })
}