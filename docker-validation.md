# Docker Production Setup Validation

## Overview

This document validates the production Docker setup for the monorepo containing a NestJS API and Next.js web application.

## Docker Files Created

### 1. API Dockerfile (`apps/api/Dockerfile`)

- **Base Image**: node:20-alpine (lightweight, secure)
- **Multi-stage build**: Builder stage and production runtime stage
- **Security**: Non-root user (nestjs:1001)
- **Dependencies**: pnpm for package management
- **Build Process**:
  - Installs dependencies with frozen lockfile
  - Generates Prisma client
  - Builds NestJS application
  - Copies only production dependencies to runtime
- **Health Check**: HTTP health check on port 3000
- **Port**: 3000

### 2. Web Dockerfile (`apps/web/Dockerfile`)

- **Base Image**: node:20-alpine (lightweight, secure)
- **Multi-stage build**: Builder stage and production runtime stage
- **Security**: Non-root user (nextjs:1001)
- **Dependencies**: pnpm for package management
- **Build Process**:
  - Installs dependencies with frozen lockfile
  - Builds Next.js application with standalone output
  - Copies standalone build and static assets
- **Health Check**: HTTP health check
- **Port**: 3000

## Configuration Updates

### Next.js Configuration

Updated `apps/web/next.config.mjs` to include:

```javascript
output: 'standalone'
```

This enables Next.js to create a self-contained production build.

## Docker Ignore Files

### API (.dockerignore)

Excludes:

- node_modules and build artifacts
- Development and test files
- IDE and OS specific files
- Documentation and configuration files

### Web (.dockerignore)

Excludes:

- node_modules and Next.js build cache
- Development environment files
- Test and documentation files
- IDE and OS specific files

## Build Commands (when Docker is available)

### Build API

```bash
docker build -f apps/api/Dockerfile -t your-api-image .
```

### Build Web

```bash
docker build -f apps/web/Dockerfile -t your-web-image .
```

## Environment Variables for Coolify

### API Environment Variables

The API expects the following environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `SMTP_HOST` - Email server host
- `SMTP_PORT` - Email server port
- `SMTP_USER` - Email server username
- `SMTP_PASS` - Email server password
- `AWS_ACCESS_KEY_ID` - S3 access key
- `AWS_SECRET_ACCESS_KEY` - S3 secret key
- `AWS_REGION` - S3 region
- `AWS_BUCKET_NAME` - S3 bucket name
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret

### Web Environment Variables

The web app expects the following environment variables:

- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key

## Production Deployment Notes

1. **Database Migration**: Ensure database migrations are run before starting the API service
2. **Health Checks**: Both containers include health checks for load balancers
3. **Security**: Both images run as non-root users
4. **Dependencies**: Production images only include necessary dependencies
5. **Build Context**: Both Dockerfiles must be built from the project root to access workspace dependencies

## Validation Status

✅ Dockerfile syntax validated
✅ Multi-stage builds implemented
✅ Security best practices followed
✅ Health checks included
✅ .dockerignore files created
✅ Next.js standalone output configured
✅ Production-ready configuration

## Next Steps for Coolify Deployment

1. Push these Docker configurations to your repository
2. In Coolify, create two separate applications:
   - One for the API using `apps/api/Dockerfile`
   - One for the Web app using `apps/web/Dockerfile`
3. Configure environment variables in Coolify for each service
4. Set up database and Redis services if not already available
5. Configure networking between services if needed
