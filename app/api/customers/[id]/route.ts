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
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          projects: true,
        },
      })
      
      if (!customer) {
        return NextResponse.json(
          { message: 'Customer not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(customer)
    } catch (error) {
      console.error('Get customer error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch customer' },
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
      await prisma.customer.delete({
        where: { id },
      })
      
      return NextResponse.json({ message: 'Customer deleted' }, { status: 204 })
    } catch (error) {
      console.error('Delete customer error:', error)
      return NextResponse.json(
        { message: 'Failed to delete customer' },
        { status: 500 }
      )
    }
  })(req)
}
