import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export type AuthenticatedRequest = NextRequest & {
  userId?: string
  userName?: string
}

export function authenticateToken(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return NextResponse.json({ message: 'Access denied' }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; userName: string }
      // Attach user info to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.userId = decoded.userId
      authenticatedReq.userName = decoded.userName
      return handler(authenticatedReq)
    } catch (error) {
      console.error('Invalid token:', error)
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 })
    }
  }
}
