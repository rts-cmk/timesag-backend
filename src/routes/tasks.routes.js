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
                include: {
                    project: { include: { customer: true } }
                }
            }
        )
        if (!task) {
            return res.status(404).json({ message: 'task not found' })
        }
        res.json(task)
    })

    router.post('/tasks', authenticateToken, async (req, res) => {
        const { title, description, projectId, estimate, assignedTo = [] } = req.body;

        // Fetch users linked to the project
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { users: true } // adjust if your schema is different
        });

        // Combine provided assignedTo with project users
        const allAssignedIds = [
            ...assignedTo,
            ...(project?.users?.map(user => user.id) || [])
        ];

        // Remove duplicates
        const uniqueAssignedIds = [...new Set(allAssignedIds)];

        const task = await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                estimate,
                assignedTo: {
                    connect: uniqueAssignedIds.map(id => ({ id }))
                }
            },
        });
        res.status(201).json(task);
    })

    router.delete('/tasks/:id', authenticateToken, async (req, res) => {
        await prisma.task.delete({
            where: { id: req.params.id },
        })
        return res.status(204).json({ message: 'task deleted' })
    })
}