'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  updateUser: (userData: Partial<User>) => void
  isInitializing: boolean
}

function decodeJwtPayload<T extends Record<string, unknown>>(token: string): T | null {
  try {
    const [, payload = ''] = token.split('.')
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    return JSON.parse(json) as T
  } catch (error) {
    console.warn('Kunne ikke afkode JWT payload:', error)
    return null
  }
}

async function fetchUserProfile(token: string, userIdHint?: string): Promise<User | null> {
  const payload = userIdHint
    ? { userId: userIdHint }
    : decodeJwtPayload<{ userId?: string }>(token)
  const userId = payload?.userId

  if (!userId) {
    return null
  }

  try {
    const response = await fetch(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      id: data.id,
      email: data.email,
      name: data.name ?? undefined,
      avatar: data.avatar ?? undefined,
    }
  } catch (error) {
    console.error('Kunne ikke hente brugerprofil:', error)
    return null
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      const savedToken = Cookies.get('token') ?? Cookies.get('jwtToken')
      const savedUser = Cookies.get('user')
      const tokenPayload = savedToken
        ? decodeJwtPayload<{ userId?: string; userName?: string }>(savedToken)
        : null

      if (savedToken && isMounted) {
        setToken(savedToken)
      }

      let resolvedUser: User | null = null

      if (savedUser) {
        try {
          resolvedUser = JSON.parse(savedUser) as User
        } catch (parseError) {
          console.warn('Kunne ikke parse bruger-cookie, rydder den:', parseError)
          Cookies.remove('user')
        }
      }

      if (!resolvedUser && savedToken) {
        const fetchedUser = await fetchUserProfile(savedToken, tokenPayload?.userId)
        if (fetchedUser) {
          resolvedUser = fetchedUser
          Cookies.set('user', JSON.stringify(fetchedUser), { expires: 1/3 })
        } else if (tokenPayload?.userId) {
          resolvedUser = {
            id: tokenPayload.userId,
            email: 'ukendt@timesag.local',
            name: tokenPayload.userName ?? undefined,
          }
          Cookies.set('user', JSON.stringify(resolvedUser), { expires: 1/3 })
        }
      }

      if (isMounted && resolvedUser) {
        setUser(resolvedUser)
      }

      if (isMounted) {
        setIsInitializing(false)
      }
    }

    restoreSession().catch((error) => {
      console.error('Fejl ved gendannelse af session:', error)
      if (isMounted) {
        setIsInitializing(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        let errorMessage = 'Login mislykkedes'

        try {
          const errorBody = await response.json()
          errorMessage = errorBody?.message ?? errorMessage
        } catch {
          try {
            const fallbackMessage = await response.text()
            if (fallbackMessage) {
              errorMessage = fallbackMessage
            }
          } catch {
            // Ignore parsing fallback errors and keep default message
          }
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      const { token, ...userData } = data

    setToken(token)
    setUser(userData)
    setIsInitializing(false)
      
      Cookies.set('token', token, { expires: 1/3 }) // 8 hours
      Cookies.set('user', JSON.stringify(userData), { expires: 1/3 })
    } catch (error) {
      const fallbackMessage = error instanceof Error ? error.message : 'Uventet login-fejl'
      throw new Error(fallbackMessage)
    }
  }

  const logout = () => {
  setToken(null)
  setUser(null)
  setIsInitializing(false)
    Cookies.remove('token')
    Cookies.remove('user')
    Cookies.remove('jwtToken')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 1/3 })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        updateUser,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
