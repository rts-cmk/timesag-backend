import prisma from '../config/prismaClient.js'
import { authenticateToken } from '../middleware.js'

export default function (router) {
    router.get('/timeentries', authenticateToken, async (req, res) => {
        const timeentries = await prisma.timeentry.findMany()
        res.json(timeentries)
    })

    router.get('/timeentries/:id', authenticateToken, async (req, res) => {
        const timeentry = await prisma.timeentry.findUnique(
            {
                where: { id: req.params.id },
            }
        )
        if (!timeentry) {
            return res.status(404).json({ message: 'timeentry not found' })
        }
        res.json(timeentry)
    })
}