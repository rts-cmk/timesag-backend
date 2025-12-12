import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth'

export async function GET(req: AuthenticatedRequest) {
  return authenticateToken(async () => {
    try {
      const customers = await prisma.customer.findMany()
      return NextResponse.json(customers)
    } catch (error) {
      console.error('Get customers error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch customers' },
        { status: 500 }
      )
    }
  })(req)
}

export async function POST(req: AuthenticatedRequest) {
  return authenticateToken(async () => {
    try {
      const body = await req.json()
      const { company, email, phone, address1, address2, postalCode, city, contactperson, contactemail } = body
      
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
      
      return NextResponse.json(customer, { status: 201 })
    } catch (error) {
      console.error('Create customer error:', error)
      return NextResponse.json(
        { message: 'Failed to create customer' },
        { status: 500 }
      )
    }
  })(req)
}
