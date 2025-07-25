# Build stage
FROM oven/bun:1.2 as builder

WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

# Production stage
FROM oven/bun:1.2 as prod
WORKDIR /app

COPY --from=builder /app .   # <-- ini harus copy semua hasil build, termasuk dist/
ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "start:prod"] 