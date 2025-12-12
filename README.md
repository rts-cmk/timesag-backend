# Timesag - Next.js Time Tracking Application

Unified frontend and backend application built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## ��� Quick Start

### 1. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/timesag"
JWT_SECRET="your-random-secret-key"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ��� Project Structure

```
timesag-backend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Login page
│   ├── layout.tsx         # Root layout
│   ├── kunder/            # Customers
│   ├── sager/             # Projects  
│   ├── brugere/           # Users
│   └── api/               # Backend API
│       ├── login/
│       ├── customers/
│       ├── projects/
│       ├── tasks/
│       └── users/
├── components/            # React components
├── lib/                   # Utilities
├── prisma/                # Database
└── public/                # Static files
```

## ��� Features

- ✅ JWT Authentication
- ✅ Customer Management (CRUD)
- ✅ Project Management (CRUD)
- ✅ Task Management (CRUD)
- ✅ User Management
- ✅ Time Entry Tracking
- ✅ Protected Routes
- ✅ TypeScript
- ✅ Tailwind CSS

## ��� Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint
```

## ���️ Database Commands

```bash
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open database GUI
```

## ��� Next Steps

1. Create `.env` file with your database URL
2. Run `npm run dev`
3. Navigate to http://localhost:3000
4. Log in with your credentials

Enjoy! ���
