import prisma from '../config/prismaClient.js'
import { authenticateToken } from '../middleware.js'

export default function (router) {
    router.get('/costumers', authenticateToken, async (req, res) => {
        const customers = await prisma.customer.findMany()
        res.json(customers)
    })

    router.get('/costumers/:id', authenticateToken, async (req, res) => {
        const customer = await prisma.customer.findUnique({
            where: { id: req.params.id },
        })
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        res.json(customer)
    })


    router.post('/costumers', authenticateToken, async (req, res) => {
        const { company, email, phone, adress1, adress2, postalCode, city, contactperson, contactemail } = req.body
        const costumer = await prisma.costumer.create({
            data: {
                company,
                email,
                phone,
                adress1,
                adress2,
                postalCode,
                city,
                contactperson,
                contactemail,
            },
        })
        res.status(201).json(costumer)
    })

    router.delete('/costumers/:id', authenticateToken, async (req, res) => {
        await prisma.costumer.delete({
            where: { id: req.params.id },
        })
            return res.status(204).json({ message: 'costumer deleted' })
    })
}