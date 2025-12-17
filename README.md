# Better Auth Practice Project

A production-ready authentication system built with Next.js 16, Better Auth, Prisma, and PostgreSQL. This project demonstrates modern security best practices and includes comprehensive email verification with Resend.

## 🚀 Features

- ✅ **Secure Authentication** - Better Auth with email/password
- ✅ **Email Verification** - Resend integration with custom verification flow
- ✅ **Strong Security** - Zod validation, XSS protection, SQL injection prevention
- ✅ **Email Enumeration Protection** - Prevents attackers from discovering registered emails
- ✅ **Password Requirements** - 8+ chars, uppercase, lowercase, number, special character
- ✅ **Real-time Validation** - Client-side form validation with password strength indicator
- ✅ **Route Protection** - Middleware-based authentication guards
- ✅ **Dark Mode** - shadcn/ui theme support with light/dark/system modes
- ✅ **Type Safety** - Full TypeScript with Zod runtime validation
- ✅ **Modern UI** - shadcn/ui components with Tailwind CSS

## 🛡️ Security Features

This project implements comprehensive security measures:

- **Input Validation** - Zod schemas prevent XSS, SQL injection, and DoS attacks
- **Email Enumeration Protection** - Generic error messages prevent user discovery
- **Password Hashing** - bcrypt via Better Auth
- **CSRF Protection** - Built into Better Auth
- **Rate Limiting** - Can be added (see documentation)
- **Secure Session Management** - HTTP-only cookies

See [SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md) and [EMAIL_ENUMERATION_PROTECTION.md](EMAIL_ENUMERATION_PROTECTION.md) for detailed security documentation.

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database
- Resend API key (for email verification)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BetterAuth_Practice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Configure the following in `.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

   # Better Auth
   BETTER_AUTH_SECRET="your-random-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"

   # Resend (for email verification)
   RESEND_API_KEY="re_xxxxxxxxxxxx"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
├── app/
│   ├── actions/          # Server actions (auth, email verification)
│   ├── dashboard/        # Protected dashboard page
│   ├── signin/           # Sign in page
│   ├── signup/           # Sign up page
│   ├── verify-email/     # Email verification page
│   └── layout.tsx        # Root layout with ThemeProvider
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── theme-provider.tsx
│   └── toggle-theme.tsx  # Theme toggle component
├── lib/
│   ├── auth.ts           # Better Auth configuration
│   ├── validations/      # Zod validation schemas
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── .github/
│   ├── workflows/        # GitHub Actions CI/CD
│   ├── ISSUE_TEMPLATE/   # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml    # Automated dependency updates
└── proxy.ts              # Route protection middleware
```

## 🧪 GitHub Actions CI/CD

This project includes a comprehensive CI/CD pipeline that runs on every push and pull request:

### Workflows

**CI Pipeline** (`.github/workflows/ci.yml`):
- **Lint & Type Check** - ESLint and TypeScript validation
- **Prisma Schema Check** - Validates database schema and migrations
- **Build** - Ensures the Next.js app builds successfully
- **Security Audit** - Checks for npm package vulnerabilities

### Running Locally

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Validate Prisma schema
npx prisma validate

# Build
npm run build
```

### Setting Up GitHub Actions

1. Push your code to GitHub
2. The workflows will run automatically on push/PR
3. Check the "Actions" tab in your GitHub repository

**Note**: You may need to add repository secrets for production deployments:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `RESEND_API_KEY`

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `BETTER_AUTH_SECRET` | Secret key for session encryption | Random 32+ character string |
| `BETTER_AUTH_URL` | Your application URL | `http://localhost:3000` (dev) |
| `RESEND_API_KEY` | Resend API key for emails | `re_xxxxxxxxxxxx` |

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Run migrations
npx prisma studio    # Open Prisma Studio (GUI)
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components with Tailwind CSS:

- **Button** - Multiple variants (default, outline, ghost, etc.)
- **DropdownMenu** - Theme toggle dropdown
- **Input** - Form inputs with validation states
- **ThemeProvider** - Dark/light/system mode support

Add new components:
```bash
npx shadcn@latest add <component-name>
```

## 🔒 Authentication Flow

1. **Sign Up** → Email verification required
2. **Email Verification** → Click link in email
3. **Sign In** → Access protected dashboard
4. **Sign Out** → Clear session

Protected routes automatically redirect unauthenticated users to sign-in.

## 📚 Documentation

- [SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md) - Detailed security vulnerability fixes
- [EMAIL_ENUMERATION_PROTECTION.md](EMAIL_ENUMERATION_PROTECTION.md) - Email enumeration attack prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please use the provided PR template and ensure:
- All tests pass
- Linting passes (`npm run lint`)
- TypeScript compiles (`npx tsc --noEmit`)
- Security checklist completed

## 🐛 Reporting Issues

Use the GitHub issue templates:
- **Bug Report** - Report bugs or issues
- **Feature Request** - Suggest new features

## 📦 Dependencies

**Core:**
- Next.js 16
- React 19
- Better Auth 1.4.7
- Prisma 5.22.0
- PostgreSQL

**UI:**
- Tailwind CSS 4
- shadcn/ui
- Radix UI
- lucide-react (icons)
- next-themes

**Validation:**
- Zod 4.1.13

**Email:**
- Resend 6.6.0

## 📄 License

This is a practice project for learning purposes.

## 🙏 Acknowledgments

- [Better Auth](https://www.better-auth.com) - Amazing authentication library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Prisma](https://www.prisma.io/) - Next-generation ORM

---

Built with ❤️ for learning modern authentication and security best practices.
