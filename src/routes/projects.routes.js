import prisma from '../config/prismaClient.js'
import { authenticateToken } from '../middleware.js'

import prisma from '../config/prismaClient.js'
import { authenticateToken } from '../middleware.js'

export default function (router) {
    router.get('/projects', authenticateToken, async (req, res) => {
        const projects = await prisma.project.findMany()
        res.json(projects)
    })

    router.get('/projects/:id', authenticateToken, async (req, res) => {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
        })
        if (!project) {
            return res.status(404).json({ message: 'project not found' })
        }
        res.json(project)
    })

    router.post('/projects', authenticateToken, async (req, res) => {
        const { name, description, customerId } = req.body
        const project = await prisma.project.create({
            data: {
                name,
                description,
                customerId,
            },
        })
        res.status(201).json(project)
    })

    
    router.delete('/projects/:id', authenticateToken, async (req, res) => {
        await prisma.project.delete({
            where: { id: req.params.id },
        })
        return res.status(204).json({ message: 'project deleted' })
    })








}