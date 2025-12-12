'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'

interface UserWithAvatar {
  id: string
  email: string
  name?: string
  avatar?: string
}

export default function Navigation() {
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const [showNav, setShowNav] = useState(false)
  const [userProfile, setUserProfile] = useState<UserWithAvatar | null>(null)

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) {
      return
    }

    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')

      if (!token) {
        return
      }

      const response = await fetch(`/api/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }, [user?.id])

  useEffect(() => {
    setShowNav(isAuthenticated)
    if (isAuthenticated && user) {
      fetchUserProfile()
    } else if (!isAuthenticated) {
      setUserProfile(null)
    }
  }, [fetchUserProfile, isAuthenticated, user])

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault()
    logout()
    router.push('/')
  }

  if (!showNav) {
    return null
  }

  return (
    <nav className="navigation">
      <ul className="navigation__list">
        <li>
          <Link 
            href="/" 
            className={pathname === '/' ? 'active' : ''}
          >
            Oversigt
          </Link>
        </li>
        <li className="online_visible">
          <Link 
            href="/kunder"
            className={pathname?.startsWith('/kunder') ? 'active' : ''}
          >
            Kunder
          </Link>
        </li>
        <li className="online_visible">
          <Link 
            href="/sager"
            className={pathname?.startsWith('/sager') ? 'active' : ''}
          >
            Sager
          </Link>
        </li>
       
      </ul>
      <div className="online_visible navigation__online_user">
        <Link href="/profil" className="navigation__user-container">
          <div className="navigation__avatar">
            {userProfile?.avatar ? (
              <Image
                src={userProfile.avatar}
                alt="Profilbillede"
                width={44}
                height={44}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
                unoptimized
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '1.125rem',
                textTransform: 'uppercase'
              }}>
                {(user?.name || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <span className="navigation__username">{userProfile?.name || user?.name || user?.email}</span>
        </Link>
        <div className="navigation__logout">
          <form onSubmit={handleLogout} className="Logout__form">
            <button type="submit" className="Logout__button button">Logud</button>
            
          </form>
        
        </div>
      </div>
    </nav>
  )
}
