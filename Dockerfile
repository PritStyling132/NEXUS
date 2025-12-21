# ================================
# Stage 1: Dependencies
# ================================
FROM node:20-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files AND prisma schema (needed for postinstall)
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies (postinstall will run prisma generate)
RUN pnpm install --frozen-lockfile || pnpm install

# ================================
# Stage 2: Builder
# ================================
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (regenerate to ensure it's in the right place)
RUN npx prisma generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js (standalone output)
RUN pnpm run build

# ================================
# Stage 3: Production Runner
# ================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema for runtime migrations/seeding
COPY --from=builder /app/prisma ./prisma

# Copy the entire node_modules from builder (includes Prisma client)
# This is needed for prisma db push and seed scripts at runtime
COPY --from=builder /app/node_modules ./node_modules

# Copy seed files and package.json
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
