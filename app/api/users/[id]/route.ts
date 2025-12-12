import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'

interface UpdateUserBody {
  name?: string
  email?: string
  currentPassword?: string
  newPassword?: string
  avatar?: string
}

export async function GET(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  return authenticateToken(async (authenticatedReq) => {
    void authenticatedReq
    try {
      const { id } = await context.params
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          tasks: true,
          timeEntries: true,
        },
      })
      
      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(user)
    } catch (error) {
      console.error('Get user error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch user', error: String(error) },
        { status: 500 }
      )
    }
  })(req)
}

export async function PUT(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  return authenticateToken(async (authenticatedReq) => {
    try {
      const { id } = await context.params
      const body = (await authenticatedReq.json()) as UpdateUserBody
      const { name, email, currentPassword, newPassword, avatar } = body

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        return NextResponse.json(
          { error: 'Bruger ikke fundet' },
          { status: 404 }
        )
      }

      // Verify user is updating their own profile
      const requestUserId = authenticatedReq.userId
      if (requestUserId !== id) {
        return NextResponse.json(
          { error: 'Du kan kun opdatere din egen profil' },
          { status: 403 }
        )
      }

      // Prepare update data
  const updateData: Prisma.UserUpdateInput = {}

      if (name !== undefined) {
        updateData.name = name
      }

      if (email !== undefined && email !== existingUser.email) {
        // Check if email is already taken
        const emailExists = await prisma.user.findUnique({
          where: { email },
        })
        if (emailExists && emailExists.id !== id) {
          return NextResponse.json(
            { error: 'E-mail er allerede i brug' },
            { status: 400 }
          )
        }
        updateData.email = email
      }

      if (avatar !== undefined) {
        updateData.avatar = avatar
      }

      // Handle password change
      if (newPassword) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: 'Nuværende adgangskode er påkrævet' },
            { status: 400 }
          )
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(
          currentPassword,
          existingUser.password
        )

        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'Nuværende adgangskode er forkert' },
            { status: 400 }
          )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        updateData.password = hashedPassword
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return NextResponse.json(updatedUser)
    } catch (error) {
      console.error('Update user error:', error)
      return NextResponse.json(
        { error: 'Kunne ikke opdatere bruger' },
        { status: 500 }
      )
    }
  })(req)
}
