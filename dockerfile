# Build stage
FROM node:20-alpine AS builder

# Install required system dependencies
RUN apk add --no-cache libc6-compat

# Enable and install pnpm manually to avoid Corepack issues
RUN npm install -g pnpm@10.4.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm run builddocker

# Production stage
FROM node:20-alpine AS runner

# Install required system dependencies
RUN apk add --no-cache libc6-compat

# Install pnpm manually to avoid Corepack issues
RUN npm install -g pnpm@10.4.0

WORKDIR /app

# Set production environment variable
ENV NODE_ENV=production

# Copy necessary files from build stage
COPY --from=builder /app ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Add a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "start"]