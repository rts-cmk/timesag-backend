'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import RequireAuth from '@/components/RequireAuth'
import { useAuth } from '@/lib/AuthContext'
import Cookies from 'js-cookie'

interface UserProfile {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface TimeEntry {
  id: string
  date: string
  timeSpent: number
  comment?: string
  task: {
    title: string
    project: {
      name: string
    }
  }
}

interface TimeEntryWithUser extends TimeEntry {
  userId: string
}

interface ProfileFormState {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  avatar: string
}

interface ProfileUpdatePayload {
  name: string
  email: string
  currentPassword?: string
  newPassword?: string
  avatar?: string
}

interface UpdatedUserResponse {
  id: string
  email: string
  name?: string
  avatar?: string | null
  createdAt: string
  updatedAt: string
}

const hourFormatter = new Intl.NumberFormat('da-DK', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const readFileAsDataUrl = (file: File): Promise<string> => (
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result ?? '') as string)
    reader.onerror = () => reject(new Error('Kunne ikke læse billedfil'))
    reader.readAsDataURL(file)
  })
)

export default function Profil() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileFormState>(
    {
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      avatar: '',
    }
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      return
    }

    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        throw new Error('Ingen session fundet')
      }

      const response = await fetch(`/api/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = (await response.json()) as UserProfile
        setProfile(data)
        setFormData({
          name: data.name || '',
          email: data.email,
          currentPassword: '',
          newPassword: '',
          avatar: data.avatar || '',
        })
        setAvatarPreview(data.avatar || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const fetchMyTimeEntries = useCallback(async () => {
    if (!user?.id) {
      return
    }

    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        throw new Error('Ingen session fundet')
      }

      const response = await fetch('/api/timeentries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = (await response.json()) as TimeEntryWithUser[]
        // Filter to only current user's entries and sort newest first
        const myEntries = data
          .filter((entry) => entry.userId === user.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setTimeEntries(myEntries)
      }
    } catch (error) {
      console.error('Error fetching time entries:', error)
    }
  }, [user?.id])

  useEffect(() => {
    fetchProfile()
    fetchMyTimeEntries()
  }, [fetchProfile, fetchMyTimeEntries])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setError('') // Clear any previous errors
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vælg venligst en billedfil (JPG, PNG, GIF)')
        e.target.value = '' // Reset input
        return
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Billedet må maksimalt være 2MB')
        e.target.value = '' // Reset input
        return
      }

      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.onerror = () => {
        setError('Kunne ikke læse billedfil')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (!user?.id) {
        setError('Brugeroplysninger blev ikke fundet. Opdater siden og prøv igen.')
        return
      }

      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        setError('Session udløbet. Log venligst ind igen.')
        return
      }

      const updatePayload: ProfileUpdatePayload = {
        name: formData.name,
        email: formData.email,
      }

      // Only include password if user wants to change it
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setError('Indtast nuværende adgangskode for at ændre den')
          return
        }
        updatePayload.currentPassword = formData.currentPassword
        updatePayload.newPassword = formData.newPassword
      }

      // If avatar file is selected, convert to base64
      if (avatarFile) {
        try {
          const base64Avatar = await readFileAsDataUrl(avatarFile)
          await sendUpdate(token, { ...updatePayload, avatar: base64Avatar })
        } catch (fileError) {
          console.error('Fejl ved læsning af avatar:', fileError)
          setError('Kunne ikke læse billedfil')
        }
        return
      }

      const existingAvatar = avatarPreview || formData.avatar
      await sendUpdate(token, existingAvatar ? { ...updatePayload, avatar: existingAvatar } : updatePayload)
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setError('Der opstod en fejl ved opdatering')
    }
  }

  const sendUpdate = async (token: string, updateData: ProfileUpdatePayload) => {
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedUser = (await response.json()) as UpdatedUserResponse
        const normalizedUser: UserProfile = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.avatar ?? undefined,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        }
        setProfile(normalizedUser)
        setSuccess('Profil opdateret!')
        setTimeout(() => setSuccess(''), 3000)
        setIsEditing(false)
        setAvatarFile(null)
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          avatar: normalizedUser.avatar || ''
        }))
        setAvatarPreview(normalizedUser.avatar || '')
        
        // Update the auth context with new user data
        updateUser({
          name: normalizedUser.name,
          email: normalizedUser.email,
          avatar: normalizedUser.avatar
        })
        Cookies.set('user', JSON.stringify(normalizedUser), { expires: 1/3 })
      } else {
        let errorMessage = 'Kunne ikke opdatere profil'
        try {
          const data = await response.json()
          errorMessage = (data as { error?: string }).error || errorMessage
        } catch {
          // Response has no JSON body
          errorMessage = `Kunne ikke opdatere profil (${response.status})`
        }
        setError(errorMessage)
      }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      setError('Der opstod en fejl ved opdatering')
    }
  }

  const calculateTotalHours = () => {
    if (!timeEntries.length) {
      return hourFormatter.format(0)
    }
    console.log('Time entries:', timeEntries)
    const totalMinutes = timeEntries.reduce((sum, entry) => {
      console.log('Entry timeSpent:', entry.timeSpent, 'Running sum:', sum)
      return sum + (entry.timeSpent || 0)
    }, 0)
    console.log('Total minutes:', totalMinutes)
    const totalHours = totalMinutes / 60
    console.log('Total hours:', totalHours)
    return hourFormatter.format(totalHours)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return '--'
    }
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}t ${mins}m`
  }

  const displayedEntries = timeEntries.slice(0, 10)

  if (loading) {
    return (
      <RequireAuth>
        <div className="profil">
          <p>Indlæser profil...</p>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="profil">
        <div className="page-header">
          <div>
            <h1>Min Profil</h1>
            <p className="page-description">Administrer dine kontooplysninger</p>
          </div>
          {!isEditing && (
            <button className="button" onClick={() => setIsEditing(true)}>
              Rediger profil
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            {success}
          </div>
        )}

        <div className="profile-grid">
          {/* Profile Information Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="user__avatar-profile" style={{ position: 'relative' }}>
                {(avatarPreview || profile?.avatar) ? (
                  <Image
                    src={avatarPreview || profile?.avatar || ''}
                    alt="Profilbillede"
                    fill
                    sizes="100px"
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                    unoptimized
                  />
                ) : (
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ padding: '1.5rem' }}
                  >
                    <path 
                      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
                      fill="white"
                      opacity="0.9"
                    />
                    <path 
                      d="M12 14C6.47715 14 2 18.4772 2 24H22C22 18.4772 17.5228 14 12 14Z" 
                      fill="white"
                      opacity="0.9"
                    />
                  </svg>
                )}
                {isEditing && (
                  <label 
                    htmlFor="avatarUpload" 
                    className="avatar-edit-button"
                    title="Ændre profilbillede"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      />
                      <path 
                        d="M3 16V8C3 6.89543 3.89543 6 5 6H6.5L8 3H16L17.5 6H19C20.1046 6 21 6.89543 21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      type="file"
                      id="avatarUpload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
              <div>
                <h2 style={{ marginBottom: '0.25rem' }}>
                  {profile?.name || 'Ingen navn'}
                </h2>
                <p style={{ opacity: 0.7, fontSize: '0.9375rem' }}>
                  {profile?.email}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Navn:</span>
                  <span className="info-value">{profile?.name || 'Ikke angivet'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">E-mail:</span>
                  <span className="info-value">{profile?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Medlem siden:</span>
                  <span className="info-value">{formatDate(profile?.createdAt || '')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Sidst opdateret:</span>
                  <span className="info-value">{formatDate(profile?.updatedAt || '')}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="formgroup">
                  <label htmlFor="name">Navn</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dit fulde navn"
                    autoComplete="name"
                  />
                </div>

                <div className="formgroup">
                  <label htmlFor="email">E-mail *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="formgroup">
                  <label htmlFor="currentPassword">Nuværende adgangskode</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Kun hvis du vil ændre adgangskode"
                    autoComplete="current-password"
                  />
                </div>

                <div className="formgroup">
                  <label htmlFor="newPassword">Ny adgangskode</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Mindst 6 tegn"
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => {
                      setIsEditing(false)
                      setError('')
                      setFormData({
                        name: profile?.name || '',
                        email: profile?.email || '',
                        currentPassword: '',
                        newPassword: '',
                        avatar: profile?.avatar || '',
                      })
                      setAvatarFile(null)
                      setAvatarPreview(profile?.avatar || '')
                    }}
                  >
                    Annuller
                  </button>
                  <button type="submit" className="button">
                    Gem ændringer
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Statistics Card */}
          <div className="profile-card">
            <h3>Mine Statistikker</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{timeEntries.length}</div>
                <div className="stat-label">Tidsregistreringer</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{calculateTotalHours()}</div>
                <div className="stat-label">Timer registreret</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Time Entries */}
        {timeEntries.length > 0 && (
          <div className="recent-activities">
            <h2>Seneste Tidsregistreringer</h2>
            <ul className="op_list">
              <li className="list-header">
                <p><strong>Opgave</strong></p>
                <p><strong>Sag</strong></p>
                <p><strong>Dato</strong></p>
                <p><strong>Tid</strong></p>
                <p><strong>Kommentar</strong></p>
              </li>
              {displayedEntries.map((entry) => (
                <li key={entry.id}>
                  <p className="indicater">{entry.task.title}</p>
                  <p>{entry.task.project.name}</p>
                  <p>{formatDate(entry.date)}</p>
                  <p>{formatTime(entry.timeSpent)}</p>
                  <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>
                    {entry.comment || 'Ingen kommentar'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </RequireAuth>
  )
}
