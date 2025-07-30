# Stage 1: Build
FROM oven/bun:1.2 AS builder
WORKDIR /app

# Copy semua source code
COPY . .

# Install dependencies dan build project
RUN bun install --frozen-lockfile
RUN bun run build

# Stage 2: Production
FROM oven/bun:1.2 AS prod
WORKDIR /app

# Copy hanya file yang dibutuhkan
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/.env ./

# Set environment dan expose port
ENV NODE_ENV=production
EXPOSE 3000

# Start command
CMD ["bun", "run", "start:prod"]
