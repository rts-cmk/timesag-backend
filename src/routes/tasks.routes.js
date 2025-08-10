import prisma from '../config/prismaClient.js'
import { authenticateToken } from '../middleware.js'

export default function (router) {
    router.get('/tasks', authenticateToken, async (req, res) => {
        const tasks = await prisma.task.findMany()
        res.json(tasks)
    })

    router.get('/tasks/:id', authenticateToken, async (req, res) => {
        const task = await prisma.task.findUnique(
            {
                where: { id: req.params.id },
            }
        )
        if (!task) {
            return res.status(404).json({ message: 'task not found' })
        }
        res.json(task)
    })
}