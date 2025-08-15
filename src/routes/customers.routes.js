import prisma from '../config/prismaClient.js'
import { authenticateToken } from '../middleware.js'

export default function (router) {
    router.get('/customers', authenticateToken, async (req, res) => {
        const customers = await prisma.customer.findMany()
        res.json(customers)
    })

    router.get('/customers/:id', authenticateToken, async (req, res) => {
        const customer = await prisma.customer.findUnique({
            where: { id: req.params.id },
        })
        if (!customer) {
            return res.status(404).json({ message: 'customer not found' })
        }
        res.json(customer)
    })


    router.post('/customers', authenticateToken, async (req, res) => {
        const { company, email, phone, address1, address2, postalCode, city, contactperson, contactemail } = req.body
        const customer = await prisma.customer.create({
            data: {
                company,
                email,
                phone,
                address1,
                address2,
                postalCode,
                city,
                contactperson,
                contactemail,
            },
        })
        res.status(201).json(customer)
    })

    router.delete('/customers/:id', authenticateToken, async (req, res) => {
        await prisma.customer.delete({
            where: { id: req.params.id },
        })
            return res.status(204).json({ message: 'customer deleted' })
    })
}