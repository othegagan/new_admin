# Build stage
FROM node:20-alpine AS builder

# Install required dependencies and pnpm
RUN apk add --no-cache libc6-compat curl
RUN npm install -g pnpm@latest

# Set working directory
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
FROM node:20-alpine AS runner

# Install required dependencies and pnpm
RUN apk add --no-cache libc6-compat curl
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /app

# Set environment variable
ENV NODE_ENV=production

# Copy necessary files from the build stage
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