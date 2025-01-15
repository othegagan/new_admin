# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS runner

# Install pnpm
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from build stage
COPY --from=builder /app ./

# Install only production dependencies without running lifecycle scripts
RUN pnpm install --prod --frozen-lockfile --ignore-scripts


# Add a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "start"]

