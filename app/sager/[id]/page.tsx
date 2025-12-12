'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import RequireAuth from '@/components/RequireAuth'

interface Task {
  id: string
  title: string
  description?: string
  estimate: number
  status: string
  userId?: string | null
  createdAt: string
  updatedAt: string
}

interface ProjectDetail {
  id: string
  name: string
  description?: string | null
  customer: {
    id: string
    company: string
  }
  createdAt: string
  updatedAt: string
  tasks: Task[]
}

interface UserOption {
  id: string
  name: string | null
  email: string
}

interface CustomerOption {
  id: string
  company: string
}

type NormalizedStatus = 'færdig' | 'igang' | 'venter' | 'afventer' | 'ukendt'

const normalizeStatus = (value?: string | null): NormalizedStatus => {
  const raw = value?.toLowerCase().trim() ?? ''

  switch (raw) {
    case 'i gang':
    case 'igang':
      return 'igang'
    case 'afventer':
    case 'på hold':
    case 'pa hold':
    case 'pending':
      return 'afventer'
    case 'afsluttet':
    case 'færdig':
    case 'faerdig':
    case 'done':
      return 'færdig'
    case 'venter':
    case 'ny':
    case 'to do':
      return 'venter'
    default:
      return 'ukendt'
  }
}

const statusClassMap: Record<NormalizedStatus, string> = {
  færdig: 'færdig',
  igang: 'igang',
  venter: 'venter',
  afventer: 'afventer',
  ukendt: 'ukendt',
}

const statusLabelMap: Record<NormalizedStatus, string> = {
  færdig: 'Afsluttet',
  igang: 'I gang',
  venter: 'Venter',
  afventer: 'Afventer',
  ukendt: 'Ukendt',
}

const statusOptions = [
  { value: 'venter', label: 'Venter' },
  { value: 'i gang', label: 'I gang' },
  { value: 'afventer', label: 'Afventer' },
  { value: 'afsluttet', label: 'Afsluttet' },
]

export default function SagDetaljer() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const createModalOpen = searchParams?.get('create') === 'true'
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [users, setUsers] = useState<UserOption[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [isUpdatingTask, setIsUpdatingTask] = useState(false)
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [projectEditError, setProjectEditError] = useState<string | null>(null)
  const [isUpdatingProject, setIsUpdatingProject] = useState(false)

  const projectId = params?.id as string | undefined

  useEffect(() => {
    if (!projectId) {
      setError('Manglende projekt-id')
      setLoading(false)
      return
    }

    const fetchAll = async () => {
      try {
        setLoading(true)
        const token = Cookies.get('token') ?? Cookies.get('jwtToken')
        if (!token) {
          throw new Error('Autorisationstoken mangler')
        }

        const [projectResponse, usersResponse, customersResponse] = await Promise.all([
          fetch(`/api/projects/${projectId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('/api/users', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('/api/customers', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        if (!projectResponse.ok) {
          throw new Error('Kunne ikke hente sagen')
        }

        if (!usersResponse.ok) {
          throw new Error('Kunne ikke hente brugere')
        }

        if (!customersResponse.ok) {
          throw new Error('Kunne ikke hente kunder')
        }

        const projectData: ProjectDetail = await projectResponse.json()
        const userData: UserOption[] = await usersResponse.json()
        const customerData: CustomerOption[] = await customersResponse.json()

        setProject(projectData)
        setUsers(userData)
        setCustomers(
          Array.isArray(customerData)
            ? customerData.map((customer) => ({ id: customer.id, company: customer.company }))
            : []
        )
        setError(null)
      } catch (fetchError) {
        console.error('Project detail error:', fetchError)
        setError('Kunne ikke indlæse sagen. Prøv igen senere.')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [projectId])

  useEffect(() => {
    if (!editingTask) {
      return
    }

    const dialog = document.querySelector('.task__dialog--edit') as HTMLDialogElement | null
    if (dialog && !dialog.open) {
      setTimeout(() => dialog.showModal(), 50)
    }

    const handleClose = () => {
      setEditingTask(null)
      setEditError(null)
      setIsUpdatingTask(false)
    }

    dialog?.addEventListener('close', handleClose)
    return () => dialog?.removeEventListener('close', handleClose)
  }, [editingTask])

  useEffect(() => {
    if (!isEditingProject) {
      return
    }

    const dialog = document.querySelector('.project__dialog--edit') as HTMLDialogElement | null
    if (dialog && !dialog.open) {
      setTimeout(() => dialog.showModal(), 50)
    }

    const handleClose = () => {
      setIsEditingProject(false)
      setProjectEditError(null)
      setIsUpdatingProject(false)
    }

    dialog?.addEventListener('close', handleClose)
    return () => dialog?.removeEventListener('close', handleClose)
  }, [isEditingProject])

  useEffect(() => {
    if (!createModalOpen || typeof window === 'undefined') {
      return
    }

    const dialog = document.querySelector('.task__dialog') as HTMLDialogElement | null
    if (dialog && !dialog.open) {
      setTimeout(() => dialog.showModal(), 100)
    }

    const handleClose = () => {
      if (createModalOpen) {
        router.replace(`/sager/${projectId}`, { scroll: false })
      }
    }

    dialog?.addEventListener('close', handleClose)
    return () => dialog?.removeEventListener('close', handleClose)
  }, [createModalOpen, projectId, router])

  const closeTaskDialog = () => {
    const dialog = document.querySelector('.task__dialog') as HTMLDialogElement | null
    if (dialog?.open) {
      dialog.close()
    }
    if (createModalOpen) {
      router.replace(`/sager/${projectId}`, { scroll: false })
    }
    setTaskError(null)
  }

  const handleTaskSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!projectId) {
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const title = (formData.get('title') as string | null)?.trim() ?? ''
    const estimate = parseFloat((formData.get('estimate') as string | null) ?? '0')
    const userId = (formData.get('userId') as string | null) || undefined
    const description = (formData.get('description') as string | null)?.trim()

    if (!title) {
      setTaskError('Angiv en titel for opgaven.')
      return
    }

    if (!Number.isFinite(estimate) || estimate <= 0) {
      setTaskError('Angiv et gyldigt estimat i timer ( > 0 ).')
      return
    }

    setIsSubmittingTask(true)
    setTaskError(null)

    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        throw new Error('Autorisationstoken mangler')
      }

      const payload = {
        title,
        estimate,
        projectId,
        status: 'venter',
        ...(description ? { description } : {}),
        ...(userId ? { userId } : {}),
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Kunne ikke oprette opgave')
      }

      form.reset()
      await refreshProject()
      closeTaskDialog()
    } catch (submitError) {
      console.error('Task creation error:', submitError)
      setTaskError('Kunne ikke oprette opgave. Prøv igen.')
    } finally {
      setIsSubmittingTask(false)
    }
  }

  const refreshProject = async () => {
    if (!projectId) {
      return
    }
    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        throw new Error('Autorisationstoken mangler')
      }
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Kunne ikke opdatere sagen')
      }
      const data: ProjectDetail = await response.json()
      setProject(data)
    } catch (refreshError) {
      console.error('Refresh project error:', refreshError)
    }
  }

  const taskStatusSummary = useMemo(() => {
    if (!project) {
      return null
    }
    const total = project.tasks.length
    const completed = project.tasks.filter((task) => normalizeStatus(task.status) === 'færdig').length
    const inProgress = project.tasks.filter((task) => normalizeStatus(task.status) === 'igang').length
    const waiting = project.tasks.filter((task) => normalizeStatus(task.status) === 'venter').length

    return { total, completed, inProgress, waiting }
  }, [project])

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setEditError(null)
  }

  const closeEditDialog = () => {
    const dialog = document.querySelector('.task__dialog--edit') as HTMLDialogElement | null
    if (dialog?.open) {
      dialog.close()
    }
    setEditingTask(null)
    setEditError(null)
    setIsUpdatingTask(false)
  }

  const openProjectEditDialog = () => {
    setIsEditingProject(true)
    setProjectEditError(null)
  }

  const closeProjectEditDialog = () => {
    const dialog = document.querySelector('.project__dialog--edit') as HTMLDialogElement | null
    if (dialog?.open) {
      dialog.close()
    }
    setIsEditingProject(false)
    setProjectEditError(null)
    setIsUpdatingProject(false)
  }

  const handleTaskUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingTask) {
      return
    }

    setEditError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const title = (formData.get('title') as string | null)?.trim() ?? ''
    const description = (formData.get('description') as string | null)?.trim()
    const estimateValue = parseFloat((formData.get('estimate') as string | null) ?? '0')
    const status = (formData.get('status') as string | null)?.trim() ?? ''
    const userIdValue = (formData.get('userId') as string | null)?.trim()

    if (!title) {
      setEditError('Angiv en titel for opgaven.')
      return
    }

    if (!Number.isFinite(estimateValue) || estimateValue <= 0) {
      setEditError('Angiv et gyldigt estimat i timer (> 0).')
      return
    }

    if (!status) {
      setEditError('Vælg en status for opgaven.')
      return
    }

    setIsUpdatingTask(true)

    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        throw new Error('Autorisationstoken mangler')
      }

      const payload = {
        title,
        estimate: estimateValue,
        status,
        description: description ? description : null,
        userId: userIdValue ? userIdValue : null,
      }

      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Kunne ikke opdatere opgaven')
      }

      await refreshProject()
      closeEditDialog()
    } catch (updateError) {
      console.error('Task update error:', updateError)
      setEditError('Kunne ikke gemme ændringerne. Prøv igen.')
    } finally {
      setIsUpdatingTask(false)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        throw new Error('Autorisationstoken mangler')
      }

      const taskToUpdate = project?.tasks.find(t => t.id === taskId)
      if (!taskToUpdate) {
        return
      }

      const payload = {
        title: taskToUpdate.title,
        estimate: taskToUpdate.estimate,
        status: newStatus,
        description: taskToUpdate.description || null,
        userId: taskToUpdate.userId || null,
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Kunne ikke opdatere status')
      }

      await refreshProject()
    } catch (updateError) {
      console.error('Status update error:', updateError)
    }
  }

  const handleProjectUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!project) {
      return
    }

    setProjectEditError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = (formData.get('name') as string | null)?.trim() ?? ''
    const description = (formData.get('description') as string | null)?.trim()
    const customerId = (formData.get('customerId') as string | null)?.trim()

    if (!name) {
      setProjectEditError('Angiv et navn for sagen.')
      return
    }

    if (!customerId) {
      setProjectEditError('Vælg en kunde.')
      return
    }

    setIsUpdatingProject(true)

    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        throw new Error('Autorisationstoken mangler')
      }

      const payload = {
        name,
        description: description ?? null,
        customerId,
      }

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Kunne ikke opdatere sagen')
      }

      await refreshProject()
      closeProjectEditDialog()
    } catch (updateError) {
      console.error('Project update error:', updateError)
      setProjectEditError('Kunne ikke gemme sagen. Prøv igen.')
    } finally {
      setIsUpdatingProject(false)
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="page-container">
          <div className="page-header">
            <p>Indlæser sag...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  if (error || !project) {
    return (
      <RequireAuth>
        <div className="page-container">
          <div className="alert alert-error" role="alert">
            {error ?? 'Sagen blev ikke fundet.'}
          </div>
          <Link href="/sager" className="button" style={{ marginTop: '1.5rem' }}>
            Tilbage til oversigten
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
            <Link href="/sager" className="back-link">
              ← Tilbage til oversigten
            </Link>
            <h1>{project.name}</h1>
            <p className="page-description">Kunde: {project.customer.company}</p>
          </div>
          <div className="page-actions">
            <button type="button" className="button secondary" onClick={openProjectEditDialog}>
              Rediger sag
            </button>
            <Link href={`/sager/${project.id}?create=true`} className="button">
              + Opret opgave
            </Link>
          </div>
        </div>

        {project.description && (
          <div className="project-description">
            <h2>Beskrivelse</h2>
            <p>{project.description}</p>
          </div>
        )}

        {taskStatusSummary && (
          <div className="project-metrics" style={{ marginBottom: '2rem' }}>
            <span className="stat-badge">{taskStatusSummary.total} opgaver i alt</span>
            <span className="stat-badge">{taskStatusSummary.completed} afsluttet</span>
            <span className="stat-badge">{taskStatusSummary.inProgress} i gang</span>
            <span className="stat-badge">{taskStatusSummary.waiting} venter</span>
          </div>
        )}

        <div className="task_list op_list">
          <li className="list-header">
            <p className="task_title">Titel</p>
            <p className="task_status">Status</p>
            <p className="task_estimate">Estimat</p>
            <p className="task_user">Bruger</p>
            <p className="task_link">Senest opdateret</p>
            <p className="task_actions">Handlinger</p>
          </li>
          {project.tasks.length === 0 ? (
            <li className="empty-row">Ingen opgaver knyttet til denne sag endnu.</li>
          ) : (
            project.tasks.map((task) => {
              const assignedUser = users.find((user) => user.id === task.userId)
              const normalizedStatus = normalizeStatus(task.status)
              const statusClass = statusClassMap[normalizedStatus] ?? normalizedStatus
              const statusLabel = statusLabelMap[normalizedStatus] ?? task.status ?? 'Ukendt'
              return (
                <li key={task.id}>
                  <p className="task_title">{task.title}</p>
                  <div className="task_status">
                    <select
                      className="status-select"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="task_estimate">{task.estimate.toFixed(1)} t</p>
                  <p className="task_user">{assignedUser?.name ?? assignedUser?.email ?? 'Ikke tildelt'}</p>
                  <p className="task_link">{new Date(task.updatedAt).toLocaleDateString('da-DK')}</p>
                  <div className="task_actions">
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => openEditDialog(task)}
                    >
                      Rediger
                    </button>
                  </div>
                </li>
              )
            })
          )}
        </div>

        <dialog className="task__dialog">
          <form onSubmit={handleTaskSubmit} className="task__form">
            <div className="dialog-header">
              <h2>Opret ny opgave</h2>
              <button type="button" onClick={closeTaskDialog} className="close-button" aria-label="Luk">
                X
              </button>
            </div>

            <div className="formgroup">
              <label htmlFor="title">Titel *</label>
              <input type="text" id="title" name="title" required placeholder="F.eks. Kickoff-møde" />
            </div>

            <div className="formgroup">
              <label htmlFor="description">Beskrivelse</label>
              <textarea id="description" name="description" rows={4} placeholder="Beskriv opgaven" />
            </div>

            <div className="formgroup">
              <label htmlFor="estimate">Estimerede timer *</label>
              <input
                type="number"
                id="estimate"
                name="estimate"
                min="0.5"
                step="0.5"
                required
              />
            </div>

            <div className="formgroup">
              <label htmlFor="userId">Tildel til</label>
              <select id="userId" name="userId" defaultValue="">
                <option value="">Vælg bruger</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name ?? user.email}
                  </option>
                ))}
              </select>
            </div>

            {taskError && (
              <p className="form-error" role="alert" style={{ marginTop: '0.5rem' }}>
                {taskError}
              </p>
            )}

            <div className="dialog-actions">
              <button type="button" className="button secondary" onClick={closeTaskDialog}>
                Annuller
              </button>
              <button type="submit" className="button" disabled={isSubmittingTask}>
                {isSubmittingTask ? 'Opretter...' : 'Opret opgave'}
              </button>
            </div>
          </form>
        </dialog>

        {editingTask && (
          <dialog className="task__dialog task__dialog--edit">
            <form onSubmit={handleTaskUpdate} className="task__form">
              <div className="dialog-header">
                <h2>Rediger opgave</h2>
                <button type="button" onClick={closeEditDialog} className="close-button" aria-label="Luk">
                  X
                </button>
              </div>

              <div className="formgroup">
                <label htmlFor="edit-title">Titel *</label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  defaultValue={editingTask.title}
                  required
                />
              </div>

              <div className="formgroup">
                <label htmlFor="edit-description">Beskrivelse</label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={4}
                  defaultValue={editingTask.description ?? ''}
                />
              </div>

              <div className="formgroup">
                <label htmlFor="edit-estimate">Estimerede timer *</label>
                <input
                  type="number"
                  id="edit-estimate"
                  name="estimate"
                  min="0.5"
                  step="0.5"
                  defaultValue={editingTask.estimate}
                  required
                />
              </div>

              <div className="formgroup">
                <label htmlFor="edit-status">Status *</label>
                <select id="edit-status" name="status" defaultValue={editingTask.status ?? 'venter'} required>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="formgroup">
                <label htmlFor="edit-userId">Tildel til</label>
                <select id="edit-userId" name="userId" defaultValue={editingTask.userId ?? ''}>
                  <option value="">Vælg bruger</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name ?? user.email}
                    </option>
                  ))}
                </select>
              </div>

              {editError && (
                <p className="form-error" role="alert" style={{ marginTop: '0.5rem' }}>
                  {editError}
                </p>
              )}

              <div className="dialog-actions">
                <button type="button" className="button secondary" onClick={closeEditDialog}>
                  Annuller
                </button>
                <button type="submit" className="button" disabled={isUpdatingTask}>
                  {isUpdatingTask ? 'Gemmer...' : 'Gem ændringer'}
                </button>
              </div>
            </form>
          </dialog>
        )}

        {isEditingProject && project && (
          <dialog className="project__dialog project__dialog--edit">
            <form onSubmit={handleProjectUpdate} className="task__form">
              <div className="dialog-header">
                <h2>Rediger sag</h2>
                <button
                  type="button"
                  onClick={closeProjectEditDialog}
                  className="close-button"
                  aria-label="Luk"
                >
                  X
                </button>
              </div>

              <div className="formgroup">
                <label htmlFor="edit-project-name">Sag navn *</label>
                <input
                  type="text"
                  id="edit-project-name"
                  name="name"
                  defaultValue={project.name}
                  required
                />
              </div>

              <div className="formgroup">
                <label htmlFor="edit-project-customer">Kunde *</label>
                <select
                  id="edit-project-customer"
                  name="customerId"
                  defaultValue={project.customer.id}
                  required
                  disabled={customers.length === 0}
                >
                  {customers.length === 0 ? (
                    <option value="" disabled>
                      Ingen kunder fundet
                    </option>
                  ) : (
                    customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.company}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="formgroup">
                <label htmlFor="edit-project-description">Beskrivelse</label>
                <textarea
                  id="edit-project-description"
                  name="description"
                  rows={4}
                  defaultValue={project.description ?? ''}
                  placeholder="Opdater beskrivelsen..."
                />
              </div>

              {projectEditError && (
                <p className="form-error" role="alert" style={{ marginTop: '0.5rem' }}>
                  {projectEditError}
                </p>
              )}

              <div className="dialog-actions">
                <button type="button" className="button secondary" onClick={closeProjectEditDialog}>
                  Annuller
                </button>
                <button type="submit" className="button" disabled={isUpdatingProject}>
                  {isUpdatingProject ? 'Gemmer...' : 'Gem sag'}
                </button>
              </div>
            </form>
          </dialog>
        )}
      </div>
    </RequireAuth>
  )
}
