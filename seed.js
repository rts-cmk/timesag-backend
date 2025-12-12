import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Test User',
      password: hashedPassword,
    },
  })

  console.log('âœ… Created test user:')
  console.log('   Email: test@test.com')
  console.log('   Password: password123')
  console.log('\ní¾¯ You can now log in with these credentials!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
