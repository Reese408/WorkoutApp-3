# Workout Again

A modern, full-stack workout tracking application built with cutting-edge technologies including Next.js 16, React 19, Prisma ORM, PostgreSQL, and TanStack Query. Track your workouts, build custom routines, monitor personal records, and achieve your fitness goals with real-time workout execution and comprehensive analytics.

## 🎯 Overview

**Workout Again** is a personalized workout tracking app that provides a complete fitness management solution. Originally started as a BetterAuth practice project, it has evolved into a production-ready application with enterprise-grade authentication, real-time workout tracking, and powerful analytics.

## ✨ Key Features

### 🏋️ Workout Management
- **Custom Workout Routines** - Create and organize personalized workout plans with multiple exercises
- **Exercise Library** - Browse and search exercises by category, muscle group, and equipment
- **Real-Time Tracking** - Execute workouts with live timers, rest periods, and set logging
- **Superset Support** - Group exercises together for efficient circuit training
- **Public Sharing** - Share workout templates with images via SEO-friendly URLs

### 📊 Progress Tracking & Analytics
- **Workout History** - Complete log of all finished workouts with detailed stats
- **Personal Records** - Automatic PR tracking using the Epley 1RM formula
- **Volume Metrics** - Track total sets, reps, weight lifted, and workout duration
- **Weekly Activity** - Monitor consistency and training frequency
- **Workout Summaries** - Detailed post-workout analytics and insights

### 🔐 Authentication & Security
- **Email/Password Auth** - Secure authentication with Better Auth
- **OAuth Integration** - Google and GitHub sign-in support
- **Two-Factor Authentication** - TOTP-based 2FA with backup codes
- **Email Verification** - Resend-powered verification flow
- **Session Management** - Secure HTTP-only cookies with auto-expiry
- **Email Enumeration Protection** - Privacy-focused security measures

### 🎨 Modern User Experience
- **Dark Mode** - Full theme support (light/dark/system)
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Beautiful Components** - shadcn/ui with Radix UI primitives
- **Smooth Animations** - Framer Motion for polished interactions
- **Type-Safe** - Full TypeScript coverage with runtime validation

### 🚀 Developer Experience
- **Server Actions** - Next.js 16 server-side mutations
- **TanStack Query** - Optimistic updates and intelligent caching
- **Prisma ORM** - Type-safe database queries with PostgreSQL
- **Docker Support** - Containerized development environment
- **CI/CD Pipeline** - GitHub Actions for automated testing and deployment

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.10 (App Router)
- **UI Library**: React 19.2.1
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4.x
- **Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React 0.561.0
- **Animations**: Framer Motion 12.23.26
- **Theme**: next-themes (dark/light/system)

### Backend
- **Database**: PostgreSQL 15 (Docker)
- **ORM**: Prisma 5.22.0
- **Authentication**: Better Auth 1.4.7
- **Email Service**: Resend 6.6.0
- **Validation**: Zod 4.1.13
- **File Storage**: AWS S3 (presigned URLs)

### State Management
- **Data Fetching**: TanStack Query 5.90.12
- **Dev Tools**: TanStack Query DevTools 5.91.1

### Security
- **Password Hashing**: bcryptjs
- **CSRF Protection**: Built-in (Better Auth)
- **Input Validation**: Zod schemas
- **Session Security**: HTTP-only cookies

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Linting**: ESLint 9
- **Dependencies**: Dependabot

## 📋 Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** 15+ (or Docker)
- **pnpm/npm** Package manager
- **Resend API Key** (for email verification)
- **AWS S3** (optional, for public workout images)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Reese408/WorkoutApp-3.git
cd app
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

Configure the following in `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5434/workout_db"

# Better Auth
BETTER_AUTH_SECRET="your-random-secret-key-32-chars-min"
BETTER_AUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AWS S3 (Optional - for public workout images)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

### 4. Start PostgreSQL with Docker
```bash
docker-compose up -d postgres
```

### 5. Set Up the Database
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed  # Optional: seed with sample exercises
```

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
BetterAuth_Practice/
├── app/
│   ├── actions/              # Server actions
│   │   ├── auth.ts           # Authentication actions
│   │   ├── exercises.ts      # Exercise CRUD
│   │   ├── routines.ts       # Routine management
│   │   ├── workouts.ts       # Workout logging & stats
│   │   └── twoFactor.ts      # 2FA management
│   ├── dashboard/            # Protected dashboard
│   ├── exercises/            # Exercise library pages
│   ├── routines/             # Workout routine pages
│   │   └── [id]/
│   │       ├── execute/      # Real-time workout tracking
│   │       └── summary/      # Post-workout summary
│   ├── workouts/             # Workout history & public workouts
│   ├── profile/              # User profile management
│   ├── signin/               # Authentication pages
│   ├── signup/
│   └── verify-email/
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── workouts/             # Workout CRUD components
│   ├── workoutViewer/        # Workout execution UI (timers, loggers)
│   ├── exercises/            # Exercise components
│   ├── header/               # Navigation
│   ├── profile/              # Profile components
│   └── security/             # 2FA components
├── hooks/
│   ├── use-exercises.ts      # Exercise data fetching
│   ├── use-routines.ts       # Routine data fetching
│   └── use-workouts.ts       # Workout logging hooks
├── lib/
│   ├── auth.ts               # Better Auth configuration
│   ├── s3.ts                 # AWS S3 utilities
│   ├── types.ts              # TypeScript types
│   ├── validations/          # Zod validation schemas
│   └── utils.ts              # Utility functions
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts               # Database seeding
├── .github/
│   ├── workflows/            # GitHub Actions CI/CD
│   ├── ISSUE_TEMPLATE/       # Issue templates
│   └── dependabot.yml        # Automated dependency updates
├── docker-compose.yml        # Docker services
└── proxy.ts                  # Route protection middleware
```

## 📊 Database Schema

### Authentication Models
- **User** - User accounts with 2FA support
- **Account** - OAuth/credential provider accounts
- **Session** - Active user sessions with auto-expiry
- **Verification** - Email verification tokens
- **TwoFactor** - 2FA secrets and backup codes
- **TwoFactorVerification** - Temporary 2FA verification codes

### Workout Models
- **Exercise** - Exercise library (name, category, muscle groups, equipment, instructions, media)
- **WorkoutRoutine** - User-created workout plans
- **WorkoutExercise** - Junction table linking exercises to routines (sets, reps, rest)
- **WorkoutProgram** - Multi-week training programs
- **ProgramRoutine** - Schedules routines within programs
- **WorkoutLog** - Individual workout sessions
- **SetLog** - Logged sets during workouts (weight, reps, duration)
- **PersonalRecord** - Best lifts per exercise (Epley 1RM)
- **PublicWorkout** - Shareable workout templates with images

### Key Features
- Cascade deletes for user ownership
- Optimistic concurrency control
- Comprehensive indexes for performance
- Type-safe queries with Prisma

## 🔐 Security Features

This application implements enterprise-grade security:

- **Input Validation** - Zod schemas prevent XSS, SQL injection, and DoS attacks
- **Email Enumeration Protection** - Generic error messages prevent user discovery
- **Password Hashing** - bcrypt via Better Auth
- **CSRF Protection** - Built into Better Auth
- **Secure Session Management** - HTTP-only cookies with SameSite
- **Two-Factor Authentication** - TOTP with backup codes
- **OAuth Security** - Account linking with dangerous mode controls
- **Rate Limiting** - Email verification and authentication throttling
- **Type Safety** - Runtime validation with Zod + compile-time with TypeScript

See [SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md) and [EMAIL_ENUMERATION_PROTECTION.md](EMAIL_ENUMERATION_PROTECTION.md) for detailed documentation.

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Build
npm run build            # Build for production
npm run start            # Start production server

# Linting & Type Checking
npm run lint             # Run ESLint
npx tsc --noEmit         # Type check without emitting

# Database
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed database with sample data
npx prisma studio        # Open Prisma Studio (GUI)

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

## 🧪 GitHub Actions CI/CD

This project includes a comprehensive CI/CD pipeline that runs on every push and pull request:

### Workflows

**CI Pipeline** (`.github/workflows/ci.yml`):
- **Lint & Type Check** - ESLint and TypeScript validation
- **Prisma Schema Check** - Validates database schema and migrations
- **Build** - Ensures the Next.js app builds successfully
- **Security Audit** - Checks for npm package vulnerabilities

### Running CI Checks Locally

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Validate Prisma schema
npx prisma validate

# Build
npm run build

# Security audit
npm audit
```

## 🎨 Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components. Add new components:

```bash
npx shadcn@latest add <component-name>

# Examples:
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add toast
```

**Configuration**: `components.json`
- Style: "new-york"
- CSS variables: enabled
- Icon library: Lucide

## 🚀 Deployment

### Environment Variables (Production)

Ensure these are set in your production environment:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | ✅ | 32+ character random string |
| `BETTER_AUTH_URL` | ✅ | Your production URL |
| `RESEND_API_KEY` | ✅ | Resend API key for emails |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth secret (optional) |
| `GITHUB_CLIENT_ID` | ❌ | GitHub OAuth (optional) |
| `GITHUB_CLIENT_SECRET` | ❌ | GitHub OAuth secret (optional) |
| `AWS_REGION` | ❌ | S3 region (optional) |
| `AWS_ACCESS_KEY_ID` | ❌ | S3 access key (optional) |
| `AWS_SECRET_ACCESS_KEY` | ❌ | S3 secret key (optional) |
| `AWS_S3_BUCKET_NAME` | ❌ | S3 bucket name (optional) |


### Pre-Deployment Checklist

- [ ] Set all required environment variables
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Configure OAuth redirect URIs (if using)
- [ ] Set up Resend domain verification
- [ ] Configure AWS S3 CORS (if using public workouts)
- [ ] Test email verification flow
- [ ] Enable 2FA for admin accounts


### In Progress
- [x] Real-time workout execution
- [x] Personal record tracking
- [x] Public workout sharing
- [x] Two-factor authentication

## 📚 Documentation

- [SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md) - Security vulnerability fixes and best practices
- [EMAIL_ENUMERATION_PROTECTION.md](EMAIL_ENUMERATION_PROTECTION.md) - Email enumeration attack prevention
- [Better Auth Docs](https://www.better-auth.com) - Authentication library documentation
- [Prisma Docs](https://www.prisma.io/docs) - ORM documentation
- [TanStack Query Docs](https://tanstack.com/query/latest) - Data fetching documentation

## 📦 Core Dependencies

**Framework & Runtime**:
- Next.js 16.0.10
- React 19.2.1
- TypeScript 5.x

**Backend**:
- Prisma 5.22.0
- Better Auth 1.4.7
- PostgreSQL 15+
- Resend 6.6.0
- AWS SDK 3.954.0

**Frontend**:
- Tailwind CSS 4.x
- shadcn/ui
- Radix UI
- Lucide React 0.561.0
- Framer Motion 12.23.26
- next-themes

**State & Data**:
- TanStack Query 5.90.12
- Zod 4.1.13

## 🙏 Acknowledgments

- [Better Auth](https://www.better-auth.com) - Modern authentication for TypeScript
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Prisma](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- [Vercel](https://vercel.com) - Next.js creators and hosting platform
