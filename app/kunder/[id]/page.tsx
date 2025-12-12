'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import RequireAuth from '@/components/RequireAuth'
import Cookies from 'js-cookie'

interface Project {
  id: string
  name: string
  description?: string
}

interface Customer {
  id: string
  company: string
  email: string
  phone: string
  address1: string
  address2?: string
  postalCode: string
  city: string
  contactperson?: string
  contactemail?: string
  projects: Project[]
}

export default function KundeDetalier() {
  const params = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCustomer = useCallback(async () => {
    if (!params?.id) {
      return
    }

    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      const response = await fetch(`/api/customers/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
    } finally {
      setLoading(false)
    }
  }, [params?.id])

  useEffect(() => {
    if (params?.id) {
      fetchCustomer()
    }
  }, [params?.id, fetchCustomer])

  if (loading) {
    return (
      <RequireAuth>
        <div className="page-container">
          <div className="page-header">
            <p>Indlæser kunde...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  if (!customer) {
    return (
      <RequireAuth>
        <div className="page-container">
          <div className="page-header">
            <p>Kunde ikke fundet</p>
          </div>
          <Link href="/kunder" className="button secondary">
            ← Tilbage til kunder
          </Link>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="page-container">
        <div className="page-header">
          <div>
            <Link href="/kunder" className="back-link">
              ← Tilbage til kunder
            </Link>
            <h1>{customer.company}</h1>
            <p className="page-description">Kunde detaljer og tilknyttede projekter</p>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h2>Kontakt information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email</span>
                <a href={`mailto:${customer.email}`} className="info-value link">
                  {customer.email}
                </a>
              </div>
              <div className="info-item">
                <span className="info-label">Telefon</span>
                <a href={`tel:${customer.phone}`} className="info-value link">
                  {customer.phone}
                </a>
              </div>
              <div className="info-item">
                <span className="info-label">Adresse</span>
                <span className="info-value">
                  {customer.address1}
                  {customer.address2 && `, ${customer.address2}`}
                  <br />
                  {customer.postalCode} {customer.city}
                </span>
              </div>
              {customer.contactperson && (
                <div className="info-item">
                  <span className="info-label">Kontaktperson</span>
                  <span className="info-value">
                    {customer.contactperson}
                    {customer.contactemail && (
                      <>
                        <br />
                        <a href={`mailto:${customer.contactemail}`} className="link">
                          {customer.contactemail}
                        </a>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-card">
            <h2>Projekter ({customer.projects.length})</h2>
            {customer.projects.length > 0 ? (
              <div className="project-list">
                {customer.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/sager/${project.id}`}
                    className="project-card"
                  >
                    <h3>{project.name}</h3>
                    {project.description && (
                      <p className="project-description">{project.description}</p>
                    )}
                    <span className="card-arrow">→</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="empty-state">Ingen projekter endnu</p>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
