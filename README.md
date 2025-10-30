# Next.js + NestJS Monorepo Template

> 🚀 **Production-Ready** - A professional, full-stack TypeScript template with enterprise-grade authentication and modern architecture.

A modern, fully-tested monorepo template featuring Next.js 15, NestJS, and a comprehensive authentication system with a beautiful UI built on shadcn/ui components. Perfect for SaaS applications, internal tools, or any full-stack project requiring robust authentication.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red.svg)](https://nestjs.com/)
[![Tests](https://img.shields.io/badge/Tests-615%20passing-brightgreen.svg)](#testing)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Highlights

- ✅ **615 Tests Passing** - Comprehensive test coverage across 43 test suites
- 🔒 **Enterprise Security** - Rate limiting, bot protection, session management, SSR route protection
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS v4
- 📦 **Monorepo** - Turborepo for optimal build caching and task execution
- 💳 **Stripe Integration** - Complete subscription and payment handling with webhook audit logging
- 📧 **Email System** - React Email templates with Nodemailer
- 🔐 **Auth System** - Email verification, password reset, role-based access control
- 📊 **Production Ready** - Helmet, CORS, Winston logging, error handling

## 📚 Documentation

- **[ROADMAP.md](ROADMAP.md)** - Future enhancements and feature roadmap
- **[CLAUDE.md](CLAUDE.md)** - Development guidelines and project conventions

## 📋 Architecture Overview

```
.
├── apps/
│   ├── api/              # NestJS backend (141 TS files)
│   │   ├── src/
│   │   │   ├── common/   # Guards, decorators, interceptors, filters
│   │   │   ├── config/   # Helmet, CORS, Swagger configuration
│   │   │   └── modules/  # Feature modules
│   │   │       ├── auth/         # Authentication & authorization
│   │   │       ├── user/         # User management
│   │   │       ├── mail/         # Email service (React Email)
│   │   │       ├── logger/       # Winston logging with rotation
│   │   │       ├── stripe/       # Subscription & payments
│   │   │       ├── s3/           # File uploads (AWS S3)
│   │   │       └── rate-limit/   # Redis-based rate limiting
│   │   └── prisma/       # Database schema and migrations
│   │
│   └── web/              # Next.js frontend (83 TS files)
│       ├── app/          # App Router pages
│       │   ├── (main)/   # Public landing page
│       │   ├── auth/     # Authentication pages
│       │   ├── dashboard/# Protected dashboard
│       │   └── legal/    # Privacy, Terms, etc.
│       ├── components/   # React components
│       ├── lib/          # API client, utilities
│       ├── hooks/        # Custom React hooks
│       └── middleware.ts # SSR route protection
│
├── packages/
│   ├── ui/               # Shared shadcn/ui components
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/# Shared TypeScript configuration
│
├── docker-compose.yml    # PostgreSQL, Redis, Mailpit, S3rver
└── turbo.json           # Turborepo configuration
```

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router and Turbopack
- **React 19** - Latest React with server components
- **TypeScript 5.7** - Type safety throughout
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Framer Motion** - Smooth animations
- **React Hook Form + Zod** - Form handling with validation
- **TanStack Query** - Server state management
- **next-themes** - Dark/light mode support

### Backend

- **NestJS 11** - Progressive Node.js framework
- **Prisma 6** - Next-generation ORM
- **PostgreSQL** - Relational database
- **Redis** - Session storage and rate limiting
- **Stripe** - Payment and subscription handling
- **Winston** - Structured logging with rotation
- **Jest** - Testing framework (615 tests)
- **Scrypt** - Password hashing (via @oslojs/crypto)

### DevOps & Tools

- **Turborepo** - High-performance monorepo build system
- **pnpm 10.4** - Fast, disk-efficient package manager
- **Docker & Docker Compose** - Development services
- **ESLint + Prettier** - Code quality and formatting
- **Husky** - Git hooks for quality checks
- **Commitlint** - Conventional commit enforcement

## 🎯 Features

### 🔐 Authentication System

- **Email/Password Auth** - Secure registration and login
- **Email Verification** - Code-based email verification
- **Password Reset** - Secure token-based reset flow
- **Session Management** - Redis-backed sessions with device tracking
- **Rate Limiting** - Configurable limits per endpoint (3 attempts/15 min on login)
- **Bot Protection** - Cloudflare Turnstile integration on sensitive endpoints
- **Role-Based Access** - USER and ADMIN roles with guards
- **SSR Route Protection** - Next.js middleware validates sessions server-side

### 💳 Stripe Integration

- **Subscription Management** - Complete lifecycle handling
- **Checkout Sessions** - Hosted checkout flow
- **Customer Portal** - Self-service subscription management
- **Webhook Handling** - Comprehensive event processing
- **Audit Logging** - All webhook events logged to database
- **Email Notifications** - Automated emails for subscription events

### 📧 Email System

- **React Email Templates** - Modern, responsive email templates
- **Nodemailer Integration** - SMTP email delivery
- **Development Mode** - Mailpit for local email testing
- **Template Types:**
  - Email verification codes
  - Password reset links
  - Account locked notifications
  - Subscription status changes

### 🎨 User Interface

- **Landing Page** - Professional hero, features, testimonials, pricing, CTA
- **Authentication Pages** - Login, register, forgot password, reset password, verify email
- **Dashboard** - Protected area with sidebar navigation
- **Legal Pages** - Privacy Policy, Terms of Service, Cookie Policy, GDPR compliance
- **Dark/Light Mode** - System preference detection with manual toggle
- **Responsive Design** - Mobile-first, works on all devices
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

### 🛡️ Security Features

- **Helmet** - Security headers (CSP, XSS protection, etc.)
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Redis-based with graceful degradation
- **Password Hashing** - Scrypt with salt (N=16384, r=16, p=1)
- **Session Security** - httpOnly, secure, sameSite cookies
- **SQL Injection Protection** - Prisma parameterized queries
- **XSS Prevention** - React automatic escaping
- **Bot Protection** - Turnstile verification on sensitive endpoints

### 📊 Logging & Monitoring

- **Winston Logger** - Structured logging with context
- **File Rotation** - Daily log rotation with retention
- **Log Levels** - Debug, info, warn, error with filtering
- **Context Logging** - Logger per service with metadata
- **Error Tracking** - Comprehensive error logging with stack traces

### 🧪 Testing

- **Unit Tests** - 615 tests across 43 test suites
- **Integration Tests** - Full request/response testing
- **Mock Coverage** - External dependencies fully mocked
- **Test Utilities** - Helper functions for common scenarios
- **CI Ready** - Fast, parallelizable test execution

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (recommended: use nvm)
- **pnpm** 10.4+ (`npm install -g pnpm@10.4.1`)
- **Docker** & **Docker Compose** (for development services)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd next-js-nest-js-template
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   # API environment
   cp apps/api/.env.example apps/api/.env

   # Web environment
   cp apps/web/.env.example apps/web/.env

   # Edit the files and add your configuration
   ```

4. **Start development services**

   ```bash
   docker-compose up -d
   ```

   This starts:

   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Mailpit (UI: 8025, SMTP: 1025)
   - S3rver (port 4569)

5. **Run database migrations**

   ```bash
   pnpm --filter=api db:migrate
   ```

6. **Generate Prisma client**

   ```bash
   pnpm --filter=api db:generate
   ```

7. **Start development servers**

   ```bash
   pnpm dev
   ```

   - API: http://localhost:3001
   - Web: http://localhost:3000
   - API Docs: http://localhost:3001/docs

### Stripe Setup (Optional)

1. **Install Stripe CLI**

   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Other platforms: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**

   ```bash
   stripe login
   ```

3. **Forward webhooks**

   ```bash
   pnpm --filter=api stripe:listen
   ```

4. **Copy webhook secret**
   - The CLI will output a webhook signing secret
   - Add it to `apps/api/.env` as `STRIPE_WEBHOOK_SECRET`

## 📦 Project Commands

### Root Level (All Apps)

```bash
pnpm dev          # Start all dev servers
pnpm build        # Build all apps
pnpm lint         # Lint all code
pnpm typecheck    # Type check all apps
pnpm format       # Format all code
pnpm release      # Build + lint + typecheck (CI check)
```

### API Commands

```bash
pnpm --filter=api dev              # Start API in watch mode
pnpm --filter=api build            # Build API for production
pnpm --filter=api test             # Run tests
pnpm --filter=api test:watch       # Run tests in watch mode
pnpm --filter=api test:cov         # Run tests with coverage
pnpm --filter=api db:generate      # Generate Prisma client
pnpm --filter=api db:migrate       # Run database migrations
pnpm --filter=api db:studio        # Open Prisma Studio
pnpm --filter=api stripe:listen    # Forward Stripe webhooks
```

### Web Commands

```bash
pnpm --filter=web dev          # Start web dev server
pnpm --filter=web build        # Build web for production
pnpm --filter=web start        # Start production server
pnpm --filter=web lint         # Lint web code
pnpm --filter=web typecheck    # Type check web code
```

### Adding UI Components

```bash
# Add a shadcn/ui component to the shared UI package
pnpm dlx shadcn@latest add button -c apps/web
```

## 🧪 Testing

The API includes comprehensive test coverage:

- **615 tests** across **43 test suites**
- **100% coverage** of business logic
- Unit tests for all services and controllers
- Integration tests for critical flows
- Mock implementations of external dependencies

Run tests:

```bash
# Run all tests
pnpm --filter=api test

# Run specific test file
pnpm --filter=api test auth.service.spec.ts

# Run tests in watch mode
pnpm --filter=api test:watch

# Generate coverage report
pnpm --filter=api test:cov
```

## 🔒 Security

This template follows security best practices with room for enhancements.

**Implemented:**

- ✅ No critical or high vulnerabilities (API dependencies updated)
- ✅ SSR route protection implemented
- ✅ Rate limiting on all sensitive endpoints
- ✅ Bot protection with Turnstile
- ✅ Secure session management (httpOnly, secure cookies)
- ✅ Password hashing with Scrypt
- ✅ Input validation on all endpoints

**Planned (Priority):**

- 🔄 CSRF protection with double-submit cookie strategy
- 🔄 Update web dependencies to latest versions
- 🔄 Frontend testing suite

## 📈 Performance

- **Fast Builds** - Turborepo with intelligent caching
- **Hot Reload** - Sub-second reload times in development
- **Optimized Production** - Tree-shaking, code splitting, lazy loading
- **Efficient Queries** - Prisma with optimized database queries
- **Redis Caching** - Session and rate limit data cached

## 🤝 Contributing

Contributions are welcome! Please read our contribution guidelines:

1. Fork the repository
2. Create a feature branch (`feature/amazing-feature`)
3. Commit your changes using conventional commits
4. Push to the branch
5. Open a Pull Request

**Commit Convention:**

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
refactor(scope): refactor code
test(scope): add tests
```

See `.commitlintrc.js` for full configuration.

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and enhancements, including:

- Two-Factor Authentication (2FA)
- Frontend testing suite
- CI/CD pipeline
- Performance monitoring
- Advanced security features
- And much more!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **NestJS** - A progressive Node.js framework
- **shadcn/ui** - Beautiful, accessible component library
- **Turborepo** - High-performance build system
- **Prisma** - Next-generation ORM

## 📞 Support

For questions, issues, or feature requests:

- 📝 Open an [issue](https://github.com/your-username/repo-name/issues)
- 💬 Start a [discussion](https://github.com/your-username/repo-name/discussions)
- 📧 Email: your-email@example.com

---

**Built with ❤️ using TypeScript, Next.js, and NestJS**

[⬆ back to top](#nextjs--nestjs-monorepo-template)
