# Build stage
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm@10.4.1

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy all package.json files for dependency resolution
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/*/

# Copy pnpm lockfile
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm db:generate

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

# Install pnpm globally
RUN npm install -g pnpm@10.4.1

# Create app user
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

# Set working directory
WORKDIR /app

# Copy package files for production install
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/generated ./apps/api/generated

# Copy Prisma schema for runtime
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/prisma ./apps/api/prisma

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "apps/api/dist/main.js"]