# Next.js + NestJS Monorepo Template

> ⚠️ **Under Construction** - This template is currently being finalized and is not yet ready for production use.

A modern, full-stack monorepo template featuring Next.js 15, NestJS, and a comprehensive authentication system with a beautiful UI built on shadcn/ui components.

## 🚧 Current Status

This template is **95% complete** but still requires some final touches before it's ready for public use. We're actively working on the remaining items.

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

### 🚧 Still To Do

- [ ] **Documentation**

  - [ ] Complete setup and deployment guides
  - [ ] API documentation with examples
  - [ ] Environment variables documentation
  - [ ] Contributing guidelines

- [ ] **Internationalization**

  - [ ] Translate Polish messages in API responses to English
  - [ ] Update error messages and validation text
  - [ ] Standardize all user-facing text to English

- [ ] **Docker Configuration**

  - [ ] Create Dockerfile for API
  - [ ] Create Dockerfile for Web
  - [ ] Multi-stage builds for production
  - [ ] Docker Compose for production deployment

- [ ] **Deployment**

  - [ ] Vercel deployment configuration
  - [ ] Railway/Render deployment guides
  - [ ] Database migration strategies
  - [ ] Environment setup guides

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
└── s3-server/    # Local S3-compatible server for development

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

## 🚀 Quick Start (for development)

```bash
# Clone the repository
git clone <repository-url>
cd next-js-nest-js-template

# Install dependencies
pnpm install

# Start development services
docker-compose up -d

# Start development servers
pnpm dev
```

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
