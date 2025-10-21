# Next.js + NestJS Monorepo Template

> ⚠️ **Under Construction** - This template is currently being finalized and is not yet ready for production use.

A modern, full-stack monorepo template featuring Next.js 15, NestJS, and a comprehensive authentication system with a beautiful UI built on shadcn/ui components.

## 🚧 Current Status

This template is **98% complete** and includes comprehensive documentation, Docker support, and production-ready configurations.

### ✅ What's Complete

- **Monorepo Setup**: Turborepo + pnpm workspace configuration
- **Backend (NestJS)**: Complete API with authentication, session management, rate limiting
- **Frontend (Next.js)**: Modern UI with landing page, dashboard, and auth flows
- **UI Components**: Full shadcn/ui integration with custom components
- **Authentication**: Complete auth system with email verification, password reset
- **Database**: Prisma ORM with PostgreSQL integration
- **Security**: Rate limiting, CSRF protection, secure sessions
- **Testing**: Comprehensive test suite for API endpoints
- **Code Quality**: TypeScript, ESLint, Prettier, pre-commit hooks
- **Legal Pages**: Privacy Policy, Terms of Service, Cookie Policy, GDPR
- **Email Templates**: Beautiful email templates for auth flows
- **Documentation**: Complete documentation site built with Fumadocs
- **Docker**: Production-ready Dockerfiles and docker-compose configurations
- **Stripe Integration**: Full subscription management and billing

### 🚧 Still To Do

- [x] **Documentation** ✅

  - [x] Complete setup and deployment guides
  - [x] API documentation with examples
  - [x] Architecture documentation
  - [x] Docker deployment guides

- [x] **Internationalization** ✅

  - [x] Translate Polish messages in API responses to English
  - [x] Update error messages and validation text
  - [x] Standardize all user-facing text to English

- [x] **Docker Configuration** ✅

  - [x] Create Dockerfile for API with multi-stage build
  - [x] Create Dockerfile for Web with multi-stage build
  - [x] .dockerignore files for optimal builds
  - [x] Docker Compose for production deployment

- [ ] **Configuration**

  - [ ] Replace placeholder company information
  - [ ] Update package.json metadata
  - [ ] License file setup
  - [ ] Contributing guidelines

- [ ] **Testing & QA**
  - [ ] E2E tests for critical user flows
  - [ ] Cross-browser testing
  - [ ] Mobile responsiveness verification
  - [ ] Performance optimization

## 📋 Architecture Overview

```
apps/
├── api/          # NestJS backend application
├── web/          # Next.js frontend application
└── docs/         # Fumadocs documentation site

packages/
├── ui/           # Shared shadcn/ui components
├── eslint-config/# Shared ESLint configuration
└── typescript-config/ # Shared TypeScript configuration
```

## 🛠️ Tech Stack

**Frontend:**

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Framer Motion
- React Hook Form + Zod

**Backend:**

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis (sessions & rate limiting)
- Jest (testing)

**DevOps & Tools:**

- Turborepo (monorepo)
- pnpm (package management)
- Docker & Docker Compose
- ESLint + Prettier
- Husky (git hooks)

## 🎯 Features

### Authentication System

- Email/password registration and login
- Email verification with codes
- Password reset functionality
- Session management with Redis
- Account security (failed login tracking, lockouts)
- Rate limiting on auth endpoints
- CSRF protection

### User Interface

- Modern, responsive design
- Dark/light mode support
- Professional landing page
- Complete dashboard layout
- Authentication forms with animations
- Legal pages (Privacy, Terms, etc.)

### Developer Experience

- Type-safe API and frontend
- Comprehensive testing
- Pre-commit code quality checks
- Hot reload in development
- Structured error handling

## 📚 Documentation

Comprehensive documentation is available at the docs site. To start the documentation locally:

```bash
pnpm --filter=docs dev
```

Then visit http://localhost:3002

The documentation includes:

- **Getting Started**: Complete setup guide
- **API Reference**: All endpoints with examples
- **Architecture**: System design and patterns
- **Deployment**: Production deployment with Docker

## 🚀 Quick Start (for development)

```bash
# Clone the repository
git clone <repository-url>
cd next-js-nest-js-template

# Install dependencies
pnpm install

# Start development services (PostgreSQL, Redis, Mailpit, S3)
docker-compose up -d

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Run database migrations
pnpm --filter=api db:migrate

# Start development servers
pnpm dev
```

This will start:

- **API** at http://localhost:3001
- **Web** at http://localhost:3000
- **Docs** at http://localhost:3002

## 🐳 Docker Deployment

Production-ready Dockerfiles are included for both API and Web applications.

### Build Docker Images

```bash
# Build API image
docker build -f apps/api/Dockerfile -t my-app-api:latest .

# Build Web image
docker build -f apps/web/Dockerfile -t my-app-web:latest .
```

### Production Deployment

Use the included `docker-compose.prod.yml` for complete stack deployment:

```bash
# Copy and configure environment variables
cp .env.prod.example .env.production

# Deploy the entire stack
docker-compose -f docker-compose.prod.yml up -d
```

For detailed deployment instructions, see the [Deployment Documentation](http://localhost:3002/docs/deployment).

## 📦 Adding shadcn/ui Components

To add components to your app, run the following command at the root:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

### Using Components

Import components from the `ui` package:

```tsx
import { Button } from '@workspace/ui/components/button'
```

## 📞 Contributing

This template is currently in active development. If you'd like to contribute or have suggestions, please feel free to:

- Open issues for bugs or feature requests
- Submit pull requests for improvements
- Provide feedback on the current implementation

## 📝 License

This template will be released under the MIT License once completed.

## 🔄 Updates

We're actively working on completing the remaining tasks. Check back soon for the final release!

---

**Estimated Completion:** 2-3 weeks

For questions or early access, please open an issue or reach out to the maintainers.
