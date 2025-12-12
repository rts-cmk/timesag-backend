import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth'

export async function GET(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  return authenticateToken(async () => {
    try {
      const { id } = await context.params
      const task = await prisma.task.findUnique({
        where: { id },
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
      
      if (!task) {
        return NextResponse.json(
          { message: 'Task not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(task)
    } catch (error) {
      console.error('Get task error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch task' },
        { status: 500 }
      )
    }
  })(req)
}

export async function DELETE(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  return authenticateToken(async () => {
    try {
      const { id } = await context.params
      await prisma.task.delete({
        where: { id },
      })
      
      return NextResponse.json({ message: 'Task deleted' }, { status: 204 })
    } catch (error) {
      console.error('Delete task error:', error)
      return NextResponse.json(
        { message: 'Failed to delete task' },
        { status: 500 }
      )
    }
  })(req)
}

export async function PUT(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  return authenticateToken(async () => {
    try {
      const { id } = await context.params
      const body = await req.json()
      const { title, description, estimate, userId, status } = body
      
      const task = await prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          estimate,
          userId,
          status,
        },
      })
      
      return NextResponse.json(task)
    } catch (error) {
      console.error('Update task error:', error)
      return NextResponse.json(
        { message: 'Failed to update task' },
        { status: 500 }
      )
    }
  })(req)
}
