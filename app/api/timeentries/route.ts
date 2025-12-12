import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth'

export async function GET(req: AuthenticatedRequest) {
  return authenticateToken(async () => {
    try {
      const timeEntries = await prisma.timeEntry.findMany({
        include: {
          task: {
            include: {
              project: {
                include: {
                  customer: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
      return NextResponse.json(timeEntries)
    } catch (error) {
      console.error('Get time entries error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch time entries' },
        { status: 500 }
      )
    }
  })(req)
}

export async function POST(req: AuthenticatedRequest) {
  return authenticateToken(async () => {
    try {
      const body = await req.json()
      const { taskId, userId, date, timeSpent, comment } = body
      
      const timeEntry = await prisma.timeEntry.create({
        data: {
          taskId,
          userId,
          date: new Date(date),
          timeSpent,
          comment,
        },
      })
      
      return NextResponse.json(timeEntry, { status: 201 })
    } catch (error) {
      console.error('Create time entry error:', error)
      return NextResponse.json(
        { message: 'Failed to create time entry' },
        { status: 500 }
      )
    }
  })(req)
}
