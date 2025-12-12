'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import RequireAuth from '@/components/RequireAuth'
import Cookies from 'js-cookie'

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
}

export default function Kunder() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const createModalOpen = searchParams?.get('create') === 'true'

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (createModalOpen && typeof window !== 'undefined') {
      const dialog = document.querySelector('.customer__dialog') as HTMLDialogElement
      if (dialog) {
        setTimeout(() => dialog.showModal(), 100)
      }
    }
  }, [createModalOpen])

  const fetchCustomers = async () => {
    try {
      const token = Cookies.get('token')
      const response = await fetch('/api/customers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      const token = Cookies.get('token')
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchCustomers()
        const dialog = document.querySelector('.customer__dialog') as HTMLDialogElement
        dialog?.close()
      }
    } catch (error) {
      console.error('Error creating customer:', error)
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="page-container">
          <div className="page-header">
            <p>Indlæser kunder...</p>
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
            <h1>Kunder</h1>
            <p className="page-description">Oversigt over alle kunder</p>
          </div>
          <Link href="?create=true" className="button">
            + Opret ny kunde
          </Link>
        </div>
        
        {customers.length === 0 ? (
          <div className="empty-state">
            <p>Ingen kunder endnu</p>
            <Link href="?create=true" className="button">Opret første kunde</Link>
          </div>
        ) : (
          <ul className="op_list">
            <li className="list-header">
              <p><strong>Firma</strong></p>
              <p><strong>Email</strong></p>
              <p><strong>Telefon</strong></p>
              <p><strong>By</strong></p>
              <p><strong>Actions</strong></p>
            </li>
            {customers.map((customer) => (
              <li key={customer.id}>
                <p className="indicater">{customer.company}</p>
                <p>{customer.email}</p>
                <p>{customer.phone}</p>
                <p>{customer.city}</p>
                <div className="flex_right">
                  <Link href={`/kunder/${customer.id}`} className="button secondary">
                    Se detaljer
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <dialog className="customer__dialog">
          <form onSubmit={handleSubmit}>
            <h2>Opret ny kunde</h2>
            <div className="form-grid">
              <div className="formgroup">
                <label>Firma navn *</label>
                <input type="text" name="company" required />
              </div>
              <div className="formgroup">
                <label>E-mail *</label>
                <input type="email" name="email" required />
              </div>
              <div className="formgroup">
                <label>Telefon *</label>
                <input type="text" name="phone" required />
              </div>
              <div className="formgroup">
                <label>Postnummer *</label>
                <input type="text" name="postalCode" required />
              </div>
              <div className="formgroup full-width">
                <label>Adresse 1 *</label>
                <input type="text" name="address1" required />
              </div>
              <div className="formgroup full-width">
                <label>Adresse 2</label>
                <input type="text" name="address2" />
              </div>
              <div className="formgroup">
                <label>By *</label>
                <input type="text" name="city" required />
              </div>
              <div className="formgroup">
                <label>Kontaktperson</label>
                <input type="text" name="contactperson" />
              </div>
              <div className="formgroup full-width">
                <label>Kontakt e-mail</label>
                <input type="email" name="contactemail" />
              </div>
            </div>
            <div className="dialog-actions">
              <button type="button" className="button secondary" onClick={() => {
                const dialog = document.querySelector('.customer__dialog') as HTMLDialogElement
                dialog?.close()
              }}>
                Annuller
              </button>
              <button type="submit" className="button">Opret kunde</button>
            </div>
          </form>
        </dialog>
      </div>
    </RequireAuth>
  )
}
