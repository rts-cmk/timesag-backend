import { authenticateToken } from './middleware.js'

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
}