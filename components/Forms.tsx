/**
 * Database Forms Component
 * Auto-generated form inputs based on Prisma schema
 */

import React from 'react'

type FormEntries = Record<string, FormDataEntryValue>

const collectFormEntries = (form: HTMLFormElement): FormEntries => {
  const formData = new FormData(form)
  return Array.from(formData.entries()).reduce<FormEntries>((acc, [key, value]) => {
    acc[key] = value
    return acc
  }, {})
}

// ============================================
// USER FORM
// ============================================
export interface UserFormData {
  email: string
  name?: string
  password?: string
  avatar?: string
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => void
  initialData?: Partial<UserFormData>
  isEdit?: boolean
}

export function UserForm({ onSubmit, initialData, isEdit = false }: UserFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const entries = collectFormEntries(e.currentTarget)

    const nameValue = (entries.name as string | undefined)?.trim()
    const passwordValue = (entries.password as string | undefined)?.trim()
    const data: UserFormData = {
      email: (entries.email as string).trim(),
    }

    if (nameValue) {
      data.name = nameValue
    }

    if (passwordValue) {
      data.password = passwordValue
    } else if (!isEdit) {
      data.password = ''
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEdit ? 'Rediger bruger' : 'Opret ny bruger'}</h2>
      
      <div className="form-grid">
        <div className="formgroup full-width">
          <label htmlFor="email">E-mail *</label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={initialData?.email}
            required
            placeholder="bruger@eksempel.dk"
            autoComplete="email"
          />
        </div>

        <div className="formgroup full-width">
          <label htmlFor="name">Navn</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={initialData?.name}
            placeholder="Fulde navn"
            autoComplete="name"
          />
        </div>

        <div className="formgroup full-width">
          <label htmlFor="password">
            Adgangskode {isEdit && '(lad tom for at beholde nuværende)'}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required={!isEdit}
            placeholder="••••••••"
            minLength={6}
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="dialog-actions">
        <button type="button" className="button secondary" onClick={() => {
          const dialog = document.querySelector('dialog[open]') as HTMLDialogElement
          dialog?.close()
        }}>
          Annuller
        </button>
        <button type="submit" className="button">
          {isEdit ? 'Gem ændringer' : 'Opret bruger'}
        </button>
      </div>
    </form>
  )
}

// ============================================
// CUSTOMER FORM
// ============================================
export interface CustomerFormData {
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

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void
  initialData?: Partial<CustomerFormData>
  isEdit?: boolean
}

export function CustomerForm({ onSubmit, initialData, isEdit = false }: CustomerFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const entries = collectFormEntries(e.currentTarget)

    const data: CustomerFormData = {
      company: (entries.company as string).trim(),
      email: (entries.email as string).trim(),
      phone: (entries.phone as string).trim(),
      address1: (entries.address1 as string).trim(),
      postalCode: (entries.postalCode as string).trim(),
      city: (entries.city as string).trim(),
    }

    const address2 = (entries.address2 as string | undefined)?.trim()
    const contactperson = (entries.contactperson as string | undefined)?.trim()
    const contactemail = (entries.contactemail as string | undefined)?.trim()

    if (address2) {
      data.address2 = address2
    }
    if (contactperson) {
      data.contactperson = contactperson
    }
    if (contactemail) {
      data.contactemail = contactemail
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEdit ? 'Rediger kunde' : 'Opret ny kunde'}</h2>
      
      <div className="form-grid">
        <div className="formgroup">
          <label htmlFor="company">Firma navn *</label>
          <input
            type="text"
            id="company"
            name="company"
            defaultValue={initialData?.company}
            required
            placeholder="Firma ApS"
          />
        </div>

        <div className="formgroup">
          <label htmlFor="email">E-mail *</label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={initialData?.email}
            required
            placeholder="kontakt@firma.dk"
          />
        </div>

        <div className="formgroup">
          <label htmlFor="phone">Telefon *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={initialData?.phone}
            required
            placeholder="+45 12 34 56 78"
          />
        </div>

        <div className="formgroup">
          <label htmlFor="postalCode">Postnummer *</label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            defaultValue={initialData?.postalCode}
            required
            placeholder="4000"
            pattern="[0-9]{4}"
          />
        </div>

        <div className="formgroup full-width">
          <label htmlFor="address1">Adresse 1 *</label>
          <input
            type="text"
            id="address1"
            name="address1"
            defaultValue={initialData?.address1}
            required
            placeholder="Vejnavn 123"
          />
        </div>

        <div className="formgroup full-width">
          <label htmlFor="address2">Adresse 2</label>
          <input
            type="text"
            id="address2"
            name="address2"
            defaultValue={initialData?.address2}
            placeholder="2. sal, th."
          />
        </div>

        <div className="formgroup">
          <label htmlFor="city">By *</label>
          <input
            type="text"
            id="city"
            name="city"
            defaultValue={initialData?.city}
            required
            placeholder="Roskilde"
          />
        </div>

        <div className="formgroup">
          <label htmlFor="contactperson">Kontaktperson</label>
          <input
            type="text"
            id="contactperson"
            name="contactperson"
            defaultValue={initialData?.contactperson}
            placeholder="Navn Navnesen"
          />
        </div>

        <div className="formgroup full-width">
          <label htmlFor="contactemail">Kontakt e-mail</label>
          <input
            type="email"
            id="contactemail"
            name="contactemail"
            defaultValue={initialData?.contactemail}
            placeholder="kontaktperson@firma.dk"
          />
        </div>
      </div>

      <div className="dialog-actions">
        <button type="button" className="button secondary" onClick={() => {
          const dialog = document.querySelector('dialog[open]') as HTMLDialogElement
          dialog?.close()
        }}>
          Annuller
        </button>
        <button type="submit" className="button">
          {isEdit ? 'Gem ændringer' : 'Opret kunde'}
        </button>
      </div>
    </form>
  )
}

// ============================================
// PROJECT FORM
// ============================================
export interface ProjectFormData {
  name: string
  description?: string
  customerId: string
}

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void
  initialData?: Partial<ProjectFormData>
  customers: Array<{ id: string; company: string }>
  isEdit?: boolean
}

export function ProjectForm({ onSubmit, initialData, customers, isEdit = false }: ProjectFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const entries = collectFormEntries(e.currentTarget)

    const data: ProjectFormData = {
      name: (entries.name as string).trim(),
      customerId: (entries.customerId as string).trim(),
    }

    const description = (entries.description as string | undefined)?.trim()
    if (description) {
      data.description = description
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEdit ? 'Rediger sag' : 'Opret ny sag'}</h2>
      
      <div className="form-grid">
        <div className="formgroup full-width">
          <label htmlFor="name">Sag navn *</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={initialData?.name}
            required
            placeholder="Website redesign"
          />
        </div>

        <div className="formgroup full-width">
          <label htmlFor="customerId">Kunde *</label>
          <select
            id="customerId"
            name="customerId"
            defaultValue={initialData?.customerId}
            required
          >
            <option value="">Vælg kunde</option>
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
            defaultValue={initialData?.description}
            placeholder="Detaljeret beskrivelse af sagen..."
            rows={4}
          />
        </div>
      </div>

      <div className="dialog-actions">
        <button type="button" className="button secondary" onClick={() => {
          const dialog = document.querySelector('dialog[open]') as HTMLDialogElement
          dialog?.close()
        }}>
          Annuller
        </button>
        <button type="submit" className="button">
          {isEdit ? 'Gem ændringer' : 'Opret sag'}
        </button>
      </div>
    </form>
  )
}

// ============================================
// TASK FORM
// ============================================
export interface TaskFormData {
  title: string
  description?: string
  projectId: string
  estimate: number
  userId?: string
  status: string
  file?: File
}

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void
  initialData?: Partial<TaskFormData> & { fileName?: string }
  projects: Array<{ id: string; name: string }>
  users?: Array<{ id: string; name?: string; email: string }>
  isEdit?: boolean
}

export function TaskForm({ onSubmit, initialData, projects, users = [], isEdit = false }: TaskFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const entries = collectFormEntries(e.currentTarget)

    const estimateValue = Number.parseFloat((entries.estimate as string) ?? '0')
    const fileEntry = entries.file
    const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : undefined

    const data: TaskFormData = {
      title: (entries.title as string).trim(),
      projectId: (entries.projectId as string).trim(),
      estimate: Number.isFinite(estimateValue) ? estimateValue : 0,
      status: (entries.status as string) || 'venter',
    }

    const description = (entries.description as string | undefined)?.trim()
    if (description) {
      data.description = description
    }

    const userId = (entries.userId as string | undefined)?.trim()
    if (userId) {
      data.userId = userId
    }

    if (file) {
      data.file = file
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEdit ? 'Rediger opgave' : 'Opret ny opgave'}</h2>
      
      <div className="form-grid">
        <div className="formgroup full-width">
          <label htmlFor="title">Opgave titel *</label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={initialData?.title}
            required
            placeholder="Design forside"
          />
        </div>

        <div className="formgroup">
          <label htmlFor="projectId">Sag *</label>
          <select
            id="projectId"
            name="projectId"
            defaultValue={initialData?.projectId}
            required
          >
            <option value="">Vælg sag</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="formgroup">
          <label htmlFor="estimate">Estimat (timer) *</label>
          <input
            type="number"
            id="estimate"
            name="estimate"
            defaultValue={initialData?.estimate}
            required
            min="0"
            step="0.5"
            placeholder="8"
          />
        </div>

        <div className="formgroup">
          <label htmlFor="status">Status *</label>
          <select
            id="status"
            name="status"
            defaultValue={initialData?.status || 'venter'}
            required
          >
            <option value="venter">Venter</option>
            <option value="igang">I gang</option>
            <option value="færdig">Færdig</option>
            <option value="afventer">Afventer</option>
          </select>
        </div>

        {users.length > 0 && (
          <div className="formgroup">
            <label htmlFor="userId">Tildel til bruger</label>
            <select
              id="userId"
              name="userId"
              defaultValue={initialData?.userId}
            >
              <option value="">Ingen tildelt</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="formgroup full-width">
          <label htmlFor="description">Beskrivelse</label>
          <textarea
            id="description"
            name="description"
            defaultValue={initialData?.description}
            placeholder="Detaljeret beskrivelse af opgaven..."
            rows={4}
          />
        </div>

        <div className="formgroup full-width">
          <label htmlFor="file">Vedhæft fil (lektie/opgave)</label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".pdf,.doc,.docx,.txt,.zip"
          />
          {initialData?.fileName && (
            <p className="text-sm" style={{ marginTop: '0.5rem', opacity: 0.7 }}>
              Nuværende fil: {initialData.fileName}
            </p>
          )}
        </div>
      </div>

      <div className="dialog-actions">
        <button type="button" className="button secondary" onClick={() => {
          const dialog = document.querySelector('dialog[open]') as HTMLDialogElement
          dialog?.close()
        }}>
          Annuller
        </button>
        <button type="submit" className="button">
          {isEdit ? 'Gem ændringer' : 'Opret opgave'}
        </button>
      </div>
    </form>
  )
}

// ============================================
// TIME ENTRY FORM
// ============================================
export interface TimeEntryFormData {
  taskId: string
  userId: string
  date: string
  timeSpent: number
  comment?: string
}

interface TimeEntryFormProps {
  onSubmit: (data: TimeEntryFormData) => void
  initialData?: Partial<TimeEntryFormData>
  tasks: Array<{ id: string; title: string }>
  users: Array<{ id: string; name?: string; email: string }>
  isEdit?: boolean
}

export function TimeEntryForm({ onSubmit, initialData, tasks, users, isEdit = false }: TimeEntryFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const entries = collectFormEntries(e.currentTarget)

    const hoursValue = Number.parseInt((entries.hours as string) ?? '0', 10)
    const minutesValue = Number.parseInt((entries.minutes as string) ?? '0', 10)
    const totalMinutes = (Number.isFinite(hoursValue) ? hoursValue : 0) * 60 + (Number.isFinite(minutesValue) ? minutesValue : 0)

    const data: TimeEntryFormData = {
      taskId: (entries.taskId as string).trim(),
      userId: (entries.userId as string).trim(),
      date: (entries.date as string).trim(),
      timeSpent: totalMinutes,
    }

    const comment = (entries.comment as string | undefined)?.trim()
    if (comment) {
      data.comment = comment
    }

    onSubmit(data)
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  // Calculate initial hours and minutes from timeSpent
  const initialHours = initialData?.timeSpent ? Math.floor(initialData.timeSpent / 60) : 0
  const initialMinutes = initialData?.timeSpent ? initialData.timeSpent % 60 : 0

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEdit ? 'Rediger tidsregistrering' : 'Ny tidsregistrering'}</h2>
      
      <div className="form-grid">
        <div className="formgroup full-width">
          <label htmlFor="taskId">Opgave *</label>
          <select
            id="taskId"
            name="taskId"
            defaultValue={initialData?.taskId}
            required
          >
            <option value="">Vælg opgave</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>

        <div className="formgroup">
          <label htmlFor="userId">Bruger *</label>
          <select
            id="userId"
            name="userId"
            defaultValue={initialData?.userId}
            required
          >
            <option value="">Vælg bruger</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="formgroup">
          <label htmlFor="date">Dato *</label>
          <input
            type="date"
            id="date"
            name="date"
            defaultValue={initialData?.date || today}
            required
            max={today}
          />
        </div>

        <div className="formgroup">
          <label htmlFor="hours">Timer</label>
          <input
            type="number"
            id="hours"
            name="hours"
            defaultValue={initialHours}
            min="0"
            step="1"
            placeholder="0"
          />
        </div>

        <div className="formgroup">
          <label htmlFor="minutes">Minutter *</label>
          <input
            type="number"
            id="minutes"
            name="minutes"
            defaultValue={initialMinutes}
            required
            min="0"
            max="59"
            step="1"
            placeholder="30"
          />
          <p className="text-sm" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
            Eks: 1t 30m = 1 time + 30 minutter
          </p>
        </div>

        <div className="formgroup full-width">
          <label htmlFor="comment">Kommentar</label>
          <textarea
            id="comment"
            name="comment"
            defaultValue={initialData?.comment}
            placeholder="Hvad lavede du i denne periode?"
            rows={3}
          />
        </div>
      </div>

      <div className="dialog-actions">
        <button type="button" className="button secondary" onClick={() => {
          const dialog = document.querySelector('dialog[open]') as HTMLDialogElement
          dialog?.close()
        }}>
          Annuller
        </button>
        <button type="submit" className="button">
          {isEdit ? 'Gem ændringer' : 'Registrer tid'}
        </button>
      </div>
    </form>
  )
}
