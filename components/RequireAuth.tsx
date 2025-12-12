'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isInitializing, router])

  if (isInitializing) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
