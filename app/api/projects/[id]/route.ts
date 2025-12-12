      import { NextResponse } from 'next/server'
      import prisma from '@/lib/prisma'
      import { authenticateToken, AuthenticatedRequest } from '@/lib/auth'
      import { Prisma } from '@prisma/client'

export async function GET(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  return authenticateToken(async () => {
    try {
      const { id } = await context.params
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          customer: true,
          tasks: true,
        },
      })
      
      if (!project) {
        return NextResponse.json(
          { message: 'Project not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(project)
    } catch (error) {
      console.error('Get project error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch project' },
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
      await prisma.project.delete({
        where: { id },
      })
      
      return NextResponse.json({ message: 'Project deleted' }, { status: 204 })
    } catch (error) {
      console.error('Delete project error:', error)
      return NextResponse.json(
        { message: 'Failed to delete project' },
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
      const { name, description, customerId } = body as {
        name?: string
        description?: string | null
        customerId?: string
      }

      if (!name || typeof name !== 'string') {
        return NextResponse.json(
          { message: 'Project name is required' },
          { status: 400 }
        )
      }

      if (!customerId || typeof customerId !== 'string') {
        return NextResponse.json(
          { message: 'Customer is required' },
          { status: 400 }
        )
      }

      const updateData: Prisma.ProjectUpdateInput = {
        name,
        description: description ?? null,
        customer: {
          connect: { id: customerId },
        },
      }
      
      const project = await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          tasks: true,
        },
      })
      
      return NextResponse.json(project)
    } catch (error) {
      console.error('Update project error:', error)
      return NextResponse.json(
        { message: 'Failed to update project' },
        { status: 500 }
      )
    }
  })(req)
}
