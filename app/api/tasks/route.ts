import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth'

export async function GET(req: AuthenticatedRequest) {
  return authenticateToken(async () => {
    try {
      const tasks = await prisma.task.findMany({
        include: {
          project: {
            include: {
              customer: true,
            },
          },
          User: true,
          timeEntries: true,
        },
      })
      return NextResponse.json(tasks)
    } catch (error) {
      console.error('Get tasks error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }
  })(req)
}

export async function POST(req: AuthenticatedRequest) {
  return authenticateToken(async () => {
    try {
      const body = await req.json()
      const { title, description, projectId, estimate, userId, status } = body
      
      const task = await prisma.task.create({
        data: {
          title,
          description,
          projectId,
          estimate,
          userId,
          status,
        },
      })
      
      return NextResponse.json(task, { status: 201 })
    } catch (error) {
      console.error('Create task error:', error)
      return NextResponse.json(
        { message: 'Failed to create task' },
        { status: 500 }
      )
    }
  })(req)
}
