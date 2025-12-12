'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Cookies from 'js-cookie'

const numberFormatter = new Intl.NumberFormat('da-DK')
const hourFormatter = new Intl.NumberFormat('da-DK', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const dateFormatter = new Intl.DateTimeFormat('da-DK', {
  day: 'numeric',
  month: 'short',
})

const formatHours = (value: number) => `${hourFormatter.format(value / 60)} t`
const formatDate = (value?: string | null) => {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return dateFormatter.format(date)
}

type NormalizedStatus = 'igang' | 'venter' | 'færdig' | 'afventer' | 'ukendt'

const normalizeStatus = (value?: string | null): NormalizedStatus => {
  const raw = value?.toLowerCase().trim() ?? ''

  switch (raw) {
    case 'i gang':
    case 'igang':
      return 'igang'
    case 'afsluttet':
    case 'færdig':
    case 'faerdig':
    case 'done':
      return 'færdig'
    case 'afventer':
    case 'på hold':
    case 'pa hold':
    case 'pending':
      return 'afventer'
    case 'venter':
    case 'ny':
    case 'to do':
      return 'venter'
    default:
      return raw ? 'ukendt' : 'ukendt'
  }
}

const statusMeta: Record<Exclude<NormalizedStatus, 'ukendt'>, { label: string; color: string; tagClass: string }> = {
  igang: { label: 'I gang', color: '#6366f1', tagClass: 'status-igang' },
  venter: { label: 'Venter', color: '#f97316', tagClass: 'status-venter' },
  færdig: { label: 'Færdig', color: '#22c55e', tagClass: 'status-færdig' },
  afventer: { label: 'Afventer', color: '#eab308', tagClass: 'status-afventer' },
}

interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  myTasks: number
  completedTasks: number
  totalCustomers: number
  totalTimeSpent: number
  myTimeSpent: number
}

interface TaskSummary {
  id: string
  title: string
  estimate: number
  status: string
  userId?: string
  projectId?: string
  fileUrl?: string | null
  fileName?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

interface ProjectSummary {
  id: string
  name: string
  customer?: {
    company: string
  }
  tasks?: TaskSummary[]
}

interface CustomerSummary {
  id: string
  company: string
}

interface TimeEntrySummary {
  id: string
  userId: string
  timeSpent: number
}

interface TaskStatusBreakdownEntry {
  key: string
  label: string
  value: number
  percentage: number
  color: string
}

interface ProjectInsight {
  id: string
  name: string
  customer?: string
  activeTasks: number
  totalTasks: number
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTasks, setRecentTasks] = useState<TaskSummary[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<TaskStatusBreakdownEntry[]>([])
  const [projectHighlights, setProjectHighlights] = useState<ProjectInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchDashboardData = useCallback(async () => {
    const userId = user?.id
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = Cookies.get('token') ?? Cookies.get('jwtToken')
      if (!token) {
        throw new Error('Mangler authentication token')
      } 

      const [projectsRes, tasksRes, customersRes, timeEntriesRes] = await Promise.all([
        fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/customers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/timeentries', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!projectsRes.ok || !tasksRes.ok || !customersRes.ok || !timeEntriesRes.ok) {
        throw new Error('Kunne ikke hente dashboarddata')
      }

      const [projectsData, tasksData, customersData, timeEntriesData] = await Promise.all([
        projectsRes.json(),
        tasksRes.json(),
        customersRes.json(),
        timeEntriesRes.json(),
      ])

  const projects = Array.isArray(projectsData) ? (projectsData as ProjectSummary[]) : []
  const tasks = Array.isArray(tasksData) ? (tasksData as TaskSummary[]) : []
      const customers = Array.isArray(customersData) ? (customersData as CustomerSummary[]) : []
      const timeEntries = Array.isArray(timeEntriesData) ? (timeEntriesData as TimeEntrySummary[]) : []

      const myTasks = tasks.filter((task) => task.userId === userId)
  const completedTasks = tasks.filter((task) => normalizeStatus(task.status) === 'færdig')
      const totalTimeSpent = timeEntries.reduce((sum, entry) => sum + (entry.timeSpent ?? 0), 0)
      const myTimeSpent = timeEntries
        .filter((entry) => entry.userId === userId)
        .reduce((sum, entry) => sum + (entry.timeSpent ?? 0), 0)

      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter((project) =>
          (project.tasks ?? []).some((task) => normalizeStatus(task.status) !== 'færdig')
        ).length,
        totalTasks: tasks.length,
        myTasks: myTasks.length,
        completedTasks: completedTasks.length,
        totalCustomers: customers.length,
        totalTimeSpent,
        myTimeSpent,
      })

      const trackedStatuses = Object.keys(statusMeta) as Array<keyof typeof statusMeta>
      const statusCounts = Object.fromEntries(trackedStatuses.map((key) => [key, 0])) as Record<keyof typeof statusMeta, number>
      let otherCount = 0

      tasks.forEach((task) => {
        const normalized = normalizeStatus(task.status)
        if (normalized !== 'ukendt' && statusCounts[normalized] !== undefined) {
          statusCounts[normalized] += 1
        } else {
          otherCount += 1
        }
      })

      const totalTasksCount = tasks.length || 1
      const breakdown: TaskStatusBreakdownEntry[] = trackedStatuses.map((key) => ({
        key,
        label: statusMeta[key].label,
        color: statusMeta[key].color,
        value: statusCounts[key] ?? 0,
        percentage: totalTasksCount > 0 ? (statusCounts[key] / totalTasksCount) * 100 : 0,
      }))

      if (otherCount > 0) {
        breakdown.push({
          key: 'andre',
          label: 'Andre',
          color: '#94a3b8',
          value: otherCount,
          percentage: (otherCount / totalTasksCount) * 100,
        })
      }

      setStatusBreakdown(breakdown)

      const tasksByProject = tasks.reduce<Record<string, { total: number; active: number }>>(
        (acc, task) => {
          const projectId = task.projectId
          if (!projectId) {
            return acc
          }
          if (!acc[projectId]) {
            acc[projectId] = { total: 0, active: 0 }
          }
          acc[projectId].total += 1
          if (normalizeStatus(task.status) !== 'færdig') {
            acc[projectId].active += 1
          }
          return acc
        },
        {}
      )

      const highlights = projects
        .map<ProjectInsight>((project) => {
          const counts = tasksByProject[project.id] ?? {
            total: (project.tasks ?? []).length,
            active: (project.tasks ?? []).filter(
              (task) => normalizeStatus(task.status) !== 'færdig'
            ).length,
          }
          return {
            id: project.id,
            name: project.name,
            customer: project.customer?.company,
            activeTasks: counts.active,
            totalTasks: counts.total,
          }
        })
        .filter((entry) => entry.totalTasks > 0 || entry.activeTasks > 0)
        .sort((a, b) => (b.activeTasks - a.activeTasks) || (b.totalTasks - a.totalTasks))
        .slice(0, 3)

      setProjectHighlights(highlights)

      const sortedTasks = [...tasks].sort((a, b) => {
        const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
        const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime()
        return bTime - aTime
      })

      setRecentTasks(sortedTasks.slice(0, 5))
    } catch (fetchError) {
      console.error('Error fetching dashboard data:', fetchError)
      setError('Kunne ikke indlæse dashboardet. Prøv igen senere.')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const chartGradient = useMemo(() => {
    const segments = statusBreakdown.filter((entry) => entry.value > 0)
    if (segments.length === 0) {
      return 'conic-gradient(#d1d5db 0deg, #d1d5db 360deg)'
    }

    let cumulative = 0
    const gradientParts = segments.map((entry) => {
      const start = cumulative
      cumulative += entry.percentage
      const end = cumulative
      return `${entry.color} ${start}% ${end}%`
    })

    return `conic-gradient(${gradientParts.join(', ')})`
  }, [statusBreakdown])

  const quickStats = useMemo(() => {
    if (!stats) {
      return []
    }

    return [
      {
        key: 'projects',
        title: 'Sager i alt',
        displayValue: numberFormatter.format(stats.totalProjects),
        subLabel: `${stats.activeProjects} aktive sager`,
        href: '/sager',
        cta: 'Administrer sager',
      },
      {
        key: 'tasks',
        title: 'Mine opgaver',
        displayValue: numberFormatter.format(stats.myTasks),
        subLabel: `${stats.totalTasks} opgaver i alt`,
        href: '/profil',
        cta: 'Se mine opgaver',
      },
      {
        key: 'customers',
        title: 'Kunder',
        displayValue: numberFormatter.format(stats.totalCustomers),
        subLabel: 'Hold relationerne varme',
        href: '/kunder',
        cta: 'Se kunder',
      },
      {
        key: 'time',
        title: 'Registrerede timer',
        displayValue: formatHours(stats.totalTimeSpent),
        subLabel: `Dine timer: ${formatHours(stats.myTimeSpent)}`,
        href: '/profil',
        cta: 'Vis tidslog',
      },
    ]
  }, [stats])

  if (loading) {
    return (
      <div className="home_online">
        <div className="dashboard-shell">
          <div className="dashboard-hero skeleton" />
          <div className="dashboard-grid">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="dashboard-card skeleton" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="home_online">
        <p>Der er ingen data at vise endnu. Prøv at oprette en sag eller opgave.</p>
      </div>
    )
  }

  return (
    <div className="home_online">
      <div className="dashboard-shell">
        <section className="dashboard-hero">
          <div className="dashboard-hero__copy">
            <p className="dashboard-eyebrow">Velkommen tilbage</p>
            <h1>Hej {user?.name || user?.email}</h1>
            <p className="dashboard-subtitle">
              Få et hurtigt overblik over sager, opgaver og kunder. Brug kortene nedenfor til at hoppe
              direkte til handling.
            </p>
          </div>
 
        </section>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <section className="dashboard-grid">
          {quickStats.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="dashboard-card"
              aria-label={item.title}
            >
              <h3>{item.title}</h3>
              <p className="dashboard-stat">{item.displayValue}</p>
              <p className="dashboard-label">{item.subLabel}</p>
            </Link>
          ))}
        </section>

        <section className="insight-grid">
          <article className="insight-card status-card">
            <div className="card-header">
              <div>
                <h2>Opgave status</h2>
                <p>Fordeling af opgaver på tværs af organisationen</p>
              </div>
            </div>
            <div className="status-card__content">
              <div className="status-donut" style={{ background: chartGradient }}>
                <div className="status-donut__center">
                  <span>{numberFormatter.format(stats.totalTasks)}</span>
                  <small>opgaver</small>
                </div>
              </div>
              <ul className="status-legend">
                {statusBreakdown.map((entry) => (
                  <li key={entry.key}>
                    <span className="status-dot" style={{ backgroundColor: entry.color }} />
                    <div>
                      <p>{entry.label}</p>
                      <small>
                        {entry.value} · {Math.round(entry.percentage)}%
                      </small>
                    </div>
                  </li>
                ))}
                {statusBreakdown.length === 0 && (
                  <li className="status-empty">Ingen opgaver registreret endnu</li>
                )}
              </ul>
            </div>
          </article>

          <article className="insight-card">
            <div className="card-header">
              <div>
                <h2>Seneste opgaver</h2>
                <p>Nyeste opdateringer på tværs af sager</p>
              </div>
              <span className="badge secondary">{numberFormatter.format(recentTasks.length)} vist</span>
            </div>
            <ul className="recent-task-list">
              {recentTasks.length === 0 && <li className="empty-row">Ingen aktivitet endnu</li>}
              {recentTasks.map((task) => (
                <li key={task.id}>
                  <div>
                    <p className="task-title">{task.title}</p>
                    <p className="task-meta">
                      {formatDate(task.updatedAt ?? task.createdAt)} · Estimat {task.estimate}t
                    </p>
                  </div>
                  {(() => {
                    const normalized = normalizeStatus(task.status)
                    const meta = normalized !== 'ukendt' ? statusMeta[normalized] : undefined
                    return (
                      <span className={`tag ${meta?.tagClass ?? 'status-ukendt'}`}>
                        {meta?.label ?? task.status ?? 'Ukendt'}
                      </span>
                    )
                  })()}
                </li>
              ))}
            </ul>
          </article>

          <article className="insight-card">
            <div className="card-header">
              <div>
                <h2>Fokus sager</h2>
                <p>Projekter med flest aktive opgaver lige nu</p>
              </div>
            </div>
            <ul className="project-highlight-list">
              {projectHighlights.length === 0 && (
                <li className="empty-row">Ingen sager har opgaver endnu</li>
              )}
              {projectHighlights.map((project) => (
                <li key={project.id}>
                  <div>
                    <p className="project-title">{project.name}</p>
                    {project.customer && <p className="task-meta">{project.customer}</p>}
                  </div>
                  <div className="project-metrics">
                    <span className="badge">{project.activeTasks} aktive</span>
                    <span className="badge secondary">{project.totalTasks} i alt</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </div>
  )
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isAuthenticated, isInitializing } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const loginModalOpen = searchParams?.get('login') === 'true'

  useEffect(() => {
    if (loginModalOpen && typeof window !== 'undefined') {
      const dialog = document.querySelector('.home__dialog') as HTMLDialogElement
      if (dialog) {
        setTimeout(() => dialog.showModal(), 100)
      }
    }
  }, [loginModalOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      router.push('/')
    } catch (submitError) {
      console.error('Login failed:', submitError)
      setError('Invalid email or password')
    }
  }

  if (isInitializing) {
    return (
      <div className="home_online">
        <div className="dashboard-shell">
          <div className="dashboard-hero skeleton" />
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Dashboard />
  }

  return (
    <div className="home_offline">
      <div>
        <h1>Roskilde Tekniske Skole</h1>
        <p>Skole Oplærings Centret</p>
        <Link href="?login=true" className="home__button">Log ind</Link>
      </div>
      <dialog className="home__dialog">
        <form onSubmit={handleSubmit} className="home__form">
          <Image 
            className="home__formlogo" 
            src="/rts_color.svg" 
            alt="Roskilde Tekniske Skole Logo" 
            width={128} 
            height={128}
          />
          <p>Log ind</p>
          <div className="formgroup">
            <label style={{ marginRight: '26em', fontFamily: 'monospace', fontSize: 'larger' }}>E-mail:</label>
            <input 
              type="email" 
              name="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              autoComplete="email"
            />
          </div>
          <div className="formgroup">
            <label style={{ marginRight: '26em', fontFamily: 'monospace', fontSize: 'larger' }}>Adgangskode:</label>
            <input 
              type="password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              autoComplete="current-password"
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button className="home__button button" type="submit">Log ind</button>
        </form>
      </dialog>
    </div>
  )
}
