'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import RequireAuth from '@/components/RequireAuth'
import Cookies from 'js-cookie'

interface User {
  id: string
  name?: string
  email: string
  profilePicture?: string
}

export default function Brugere() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = Cookies.get('token')
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="page-container">
          <div className="page-header">
            <p>Indlæser brugere...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Brugere</h1>
            <p className="page-description">Oversigt over alle brugere</p>
          </div>
        </div>
        
        {users.length === 0 ? (
          <div className="empty-state">
            <p>Ingen brugere fundet</p>
          </div>
        ) : (
          <ul className="op_list">
            <li className="list-header">
              <p><strong>Avatar</strong></p>
              <p><strong>Navn</strong></p>
              <p><strong>Email</strong></p>
              <p><strong>Actions</strong></p>
            </li>
            {users.map((user) => (
              <li key={user.id}>
                <div className="user__avatar">
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.name || 'User avatar'}
                      width={50}
                      height={50}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                      unoptimized
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%' }} />
                  )}
                </div>
                <p className="indicater">{user.name || 'Unavngivet'}</p>
                <p>{user.email}</p>
                <div className="flex_right">
                  <Link href={`/brugere/${user.id}`} className="button">
                    Se profil
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RequireAuth>
  )
}
