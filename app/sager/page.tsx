'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import RequireAuth from '@/components/RequireAuth'
import Cookies from 'js-cookie'

interface Project {
  id: string
  name: string
  description?: string
  customer: {
    company: string
  }
}

interface CustomerOption {
  id: string
  company: string
}

export default function Sager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const createModalOpen = searchParams?.get('create') === 'true'

  useEffect(() => {
    fetchProjects()
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (createModalOpen && typeof window !== 'undefined') {
      const dialog = document.querySelector('.project__dialog') as HTMLDialogElement | null
      if (dialog && !dialog.open) {
        setTimeout(() => dialog.showModal(), 100)
      }
    }
  }, [createModalOpen])

  useEffect(() => {
    const dialog = document.querySelector('.project__dialog') as HTMLDialogElement | null
    if (!dialog) {
      return
    }

    const handleClose = () => {
      if (createModalOpen) {
        router.replace('/sager', { scroll: false })
      }
    }

    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [createModalOpen, router])

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        throw new Error('Autorisationstoken mangler')
      }

      const response = await fetch('/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Kunne ikke hente sager')
      }

      const data = await response.json()
      setProjects(data)
    } catch (fetchError) {
      console.error('Error fetching projects:', fetchError)
      setError('Kunne ikke hente sager. Prøv igen senere.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        return
      }

      const response = await fetch('/api/customers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Kunne ikke hente kunder')
      }

      const data = await response.json()
      const options = Array.isArray(data)
        ? data.map((customer) => ({ id: customer.id, company: customer.company }))
        : []
      setCustomers(options)
    } catch (fetchError) {
      console.error('Error fetching customers:', fetchError)
    }
  }

  const closeCreateDialog = () => {
    const dialog = document.querySelector('.project__dialog') as HTMLDialogElement | null
    if (dialog?.open) {
      dialog.close()
    }
    if (createModalOpen) {
      router.replace('/sager', { scroll: false })
    }
  }

  const handleProjectSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = (formData.get('name') as string | null)?.trim() ?? ''
    const customerId = (formData.get('customerId') as string | null)?.trim() ?? ''
    const description = (formData.get('description') as string | null)?.trim()

    if (!name) {
      setSubmitError('Angiv et navn for sagen.')
      return
    }

    if (!customerId) {
      setSubmitError('Vælg en kunde til sagen.')
      return
    }

    setIsSubmitting(true)

    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        throw new Error('Autorisationstoken mangler')
      }

      const payload = {
        name,
        customerId,
        ...(description ? { description } : {}),
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Kunne ikke oprette sag')
      }

      form.reset()
      await fetchProjects()
      closeCreateDialog()
    } catch (submitErr) {
      console.error('Error creating project:', submitErr)
      setSubmitError('Kunne ikke oprette sag. Prøv igen.')
    } finally {
      setIsSubmitting(false)
    }
  }



  if (loading) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-8">
          <p>Indlæser sager...</p>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="page-header">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sager (Projekter)</h1>
            <p className="page-description">Overblik over aktive sager og deres kunder</p>
          </div>
          <Link href="?create=true" className="button">
            + Opret ny sag
          </Link>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="empty-state">
            <p>Ingen sager endnu</p>
            <p style={{ opacity: 0.7 }}>Opret din første sag for at komme i gang.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/sager/${project.id}`} className="project-card">
                <h2 className="project-card__title">{project.name}</h2>
                {project.description && (
                  <p className="project-card__desc">{project.description}</p>
                )}
                <p className="project-card__meta">Kunde: {project.customer.company}</p>
              </Link>
            ))}
          </div>
        )}

        <dialog className="project__dialog">
          <form onSubmit={handleProjectSubmit} className="project__form">
            <h2>Opret ny sag</h2>

            <div className="form-grid">
              <div className="formgroup full-width">
                <label htmlFor="name">Sag navn *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Website redesign"
                  autoFocus
                />
              </div>

              <div className="formgroup full-width">
                <label htmlFor="customerId">Kunde *</label>
                <select
                  id="customerId"
                  name="customerId"
                  required
                  disabled={customers.length === 0}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {customers.length === 0 ? 'Opret en kunde først' : 'Vælg kunde'}
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="formgroup full-width">
                <label htmlFor="description">Beskrivelse</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Detaljeret beskrivelse af sagen..."
                  rows={4}
                />
              </div>
            </div>

            {submitError && (
              <p className="form-error" role="alert" style={{ marginTop: '0.5rem' }}>
                {submitError}
              </p>
            )}

            <div className="dialog-actions">
              <button
                type="button"
                className="button secondary"
                onClick={closeCreateDialog}
              >
                Annuller
              </button>
              <button
                type="submit"
                className="button"
                disabled={isSubmitting || customers.length === 0}
              >
                {isSubmitting ? 'Opretter...' : 'Opret sag'}
              </button>
            </div>
          </form>
        </dialog>
      </div>
    </RequireAuth>
  )
}
