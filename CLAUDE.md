# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo template featuring a NestJS API backend and Next.js frontend with shadcn/ui components. The project is structured as a Turborepo workspace using pnpm for dependency management.

### Key Architecture Components

- **Backend (apps/api)**: NestJS application with authentication, session management, rate limiting, and file uploads
- **Frontend (apps/web)**: Next.js 15 application with React Query, authentication flows, and form handling
- **UI Package (packages/ui)**: Shared shadcn/ui components used across applications
- **Shared Configs**: ESLint, TypeScript, and other configuration packages

## Development Commands

### Root Level Commands (use these for most tasks)

```bash
# Start development servers for all apps
pnpm dev

# Build all applications
pnpm build

# Lint all code
pnpm lint

# Type check all applications
pnpm typecheck

# Format all code
pnpm format

# Full release check (build + lint + typecheck)
pnpm release
```

### API-Specific Commands

```bash
# Generate Prisma client (run after schema changes)
pnpm --filter=api db:generate

# Run database migrations
pnpm --filter=api db:migrate

# Open Prisma Studio
pnpm --filter=api db:studio

# Seed categories data
pnpm --filter=api db:seed-categories

# Run API tests
pnpm --filter=api test

# Run specific test files
pnpm --filter=api test filename.spec.ts

# Run API tests in watch mode
pnpm --filter=api test:watch

# Run API tests with coverage
pnpm --filter=api test:cov

# Run E2E tests
pnpm --filter=api test:e2e

# Start API in development mode
pnpm --filter=api start:dev

# Build API only
pnpm --filter=api build

# Lint API only
pnpm --filter=api lint

# Type check API only
pnpm --filter=api typecheck
```

### Web-Specific Commands

```bash
# Start web development server
pnpm --filter=web dev

# Build web application only
pnpm --filter=web build

# Lint web application only
pnpm --filter=web lint

# Type check web application only
pnpm --filter=web typecheck
```

### Adding shadcn/ui Components

```bash
# Add components to the ui package (run from project root)
pnpm dlx shadcn@latest add button -c apps/web
```

## Architecture Details

### Authentication System

The API implements a comprehensive authentication system:

- **Session Management**: Cookie-based sessions with Redis storage
- **Password Security**: Scrypt-based password hashing with salt
- **Account Security**: Failed login tracking, account locking, and rate limiting
- **Email Verification**: Code-based email verification system
- **Password Reset**: Secure token-based password reset flow
- **Turnstile Integration**: Cloudflare Turnstile for bot protection

### Database Schema (Prisma)

Key models include:

- `User`: Core user data with security tracking fields
- `Session`: User sessions with device/IP tracking
- `EmailVerificationCode`: Email verification codes
- `PasswordResetToken`: Password reset tokens
- Enum: `Role` (USER, ADMIN)

### Module Structure (API)

- **Auth Module**: Authentication endpoints and services
- **User Module**: User management operations
- **Mail Module**: Email service with React Email templates
- **Logger Module**: Winston-based logging with file rotation
- **Rate Limit Module**: Redis-based rate limiting
- **S3 Module**: AWS S3 integration for file uploads
- **Prisma Module**: Database connection and service

### Frontend Architecture

- **Authentication**: React Query hooks for auth state management
- **Forms**: React Hook Form with Zod validation
- **UI**: shadcn/ui components with Tailwind CSS
- **Themes**: next-themes for dark/light mode support
- **API Client**: Axios-based client with error handling

## Development Environment

### Required Services

Start with Docker Compose:

```bash
docker-compose up -d
```

This provides:

- **PostgreSQL**: Database (port 5432)
- **Redis**: Session and rate limit storage (port 6379)
- **Mailpit**: Email testing (port 8025 for UI, 1025 for SMTP)
- **S3rver**: Local S3-compatible storage (port 4569)

### Environment Files

- `apps/api/.env`: API configuration (database, Redis, email, etc.)
- `apps/web/.env`: Web app configuration (API endpoints, Turnstile keys, etc.)

### Testing Strategy

- **Unit Tests**: Jest with extensive mocking for external dependencies
- **Integration Tests**: E2E tests using Supertest
- **Coverage**: Comprehensive coverage excluding DTOs, entities, and infrastructure files

## Git Workflow

### Commit Message Convention

Follows conventional commits with specific scopes:

- **Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **Scopes**: api, web, ui, shared, deps, config, release, ci, docs, tests

### Pre-commit Hooks

- **lint-staged**: Formats code with Prettier
- **pnpm lint**: Runs ESLint checks
- **commitlint**: Validates commit message format

## Important Notes

### Prisma Client Location

The Prisma client is generated to `apps/api/generated/prisma` (not the default location). This is configured in `schema.prisma`.

### Package Manager

This project uses pnpm v10.4.1. Always use pnpm commands, never npm or yarn.

### Turbopack

Next.js is configured to use Turbopack in development for faster builds.

### Authentication Flow

The authentication system uses:

1. Session cookies (httpOnly, secure, sameSite)
2. CSRF protection via session tokens
3. Rate limiting on auth endpoints
4. Account lockout after failed attempts
5. Email verification requirement for new accounts

### File Upload System

S3 service is configured for file uploads with:

- Local development using s3rver
- Proper error handling and validation
- Integration with NestJS multer middleware
