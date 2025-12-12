import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth'

export async function GET(req: AuthenticatedRequest) {
  return authenticateToken(async () => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      return NextResponse.json(users)
    } catch (error) {
      console.error('Get users error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch users' },
        { status: 500 }
      )
    }
  })(req)
}
