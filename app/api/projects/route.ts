import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth'

type ProjectWithRelations = Awaited<ReturnType<typeof loadProjects>>[number]

async function loadProjects() {
  return prisma.project.findMany({
    include: {
      customer: true,
      tasks: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

async function ensureDemoProject() {
  const demoCustomerEmail = 'demo.customer@timesag.local'
  const demoProjectName = 'Demo Sag – Website Redesign'

  let customer = await prisma.customer.findUnique({
    where: { email: demoCustomerEmail },
  })

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        company: 'Demo Kunde ApS',
        email: demoCustomerEmail,
        phone: '70101010',
        address1: 'Eksempelvej 42',
        postalCode: '2100',
        city: 'København Ø',
        contactperson: 'Demo Kontakt',
        contactemail: 'demo.contact@timesag.local',
      },
    })
  }

  const existingProject = await prisma.project.findFirst({
    where: {
      name: demoProjectName,
      customerId: customer.id,
    },
    include: {
      customer: true,
      tasks: true,
    },
  })

  if (existingProject) {
    return existingProject
  }

  const plannedStart = new Date('2024-01-15T08:00:00Z')
  const lastUpdated = new Date('2024-02-01T12:00:00Z')

  return prisma.project.create({
    data: {
      name: demoProjectName,
      description: 'Automatisk oprettet demonstrationssag til at udfylde Sager-oversigten.',
      customerId: customer.id,
      createdAt: plannedStart,
      updatedAt: lastUpdated,
      tasks: {
        create: [
          {
            title: 'Kick-off og kravafstemning',
            description: 'Afhold opstartsmøde og få de sidste krav på plads.',
            estimate: 8.5,
            status: 'i gang',
            createdAt: new Date('2024-01-16T09:00:00Z'),
            updatedAt: new Date('2024-01-20T15:30:00Z'),
          },
          {
            title: 'Design sprint',
            description: 'Udarbejd skitser og klikbar prototype til kunden.',
            estimate: 16,
            status: 'afsluttet',
            createdAt: new Date('2024-01-21T08:00:00Z'),
            updatedAt: new Date('2024-01-28T14:45:00Z'),
          },
          {
            title: 'Implementering af frontend',
            description: 'Opsætning af komponenter og tilknytning af CMS-indhold.',
            estimate: 24,
            status: 'venter',
            createdAt: new Date('2024-01-29T08:00:00Z'),
          },
        ],
      },
    },
    include: {
      customer: true,
      tasks: true,
    },
  })
}

function withDerivedFields(projects: ProjectWithRelations[]) {
  return projects.map((project) => {
    const completedTasks = project.tasks.filter((task) => task.status === 'afsluttet').length
    const inProgressTasks = project.tasks.filter((task) => task.status === 'i gang').length

    return {
      ...project,
      startedAt: project.createdAt,
      lastUpdatedAt: project.updatedAt,
      taskSummary: {
        total: project.tasks.length,
        completed: completedTasks,
        inProgress: inProgressTasks,
        remaining: project.tasks.length - completedTasks,
      },
    }
  })
}

export async function GET(req: AuthenticatedRequest) {
  return authenticateToken(async () => {
    try {
      let projects = await loadProjects()

      if (projects.length === 0) {
        const demoProject = await ensureDemoProject()
        projects = demoProject ? [demoProject] : []
      }

      return NextResponse.json(withDerivedFields(projects))
    } catch (error) {
      console.error('Get projects error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch projects' },
        { status: 500 }
      )
    }
  })(req)
}

export async function POST(req: AuthenticatedRequest) {
  return authenticateToken(async () => {
    try {
      const body = await req.json()
      const { name, description, customerId } = body
      
      const project = await prisma.project.create({
        data: {
          name,
          description,
          customerId,
        },
        include: {
          customer: true,
          tasks: true,
        },
      })
      
      return NextResponse.json(withDerivedFields([project])[0], { status: 201 })
    } catch (error) {
      console.error('Create project error:', error)
      return NextResponse.json(
        { message: 'Failed to create project' },
        { status: 500 }
      )
    }
  })(req)
}
