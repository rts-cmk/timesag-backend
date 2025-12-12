import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Prisma } from '@prisma/client'

const DEMO_EMAIL = 'demo@timesag.local'
const DEMO_PASSWORD = 'Demo1234!'

async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })
  if (existing) {
    return existing
  }

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)

  try {
    return await prisma.user.create({
      data: {
        name: 'Demo Bruger',
        email: DEMO_EMAIL,
        password: hashedPassword,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existingUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })
      if (existingUser) {
        return existingUser
      }
    }
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    await ensureDemoUser()
    
    if (!body.email || !body.password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    const isValid = await bcrypt.compare(body.password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
  const { password: _password, ...userWithoutPassword } = user
  void _password

    const token = jwt.sign(
      { userId: user.id, userName: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    )

    return NextResponse.json({ ...userWithoutPassword, token })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
