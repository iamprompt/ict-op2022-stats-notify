FROM node:16-alpine AS node-base
RUN npm install -g pnpm

FROM node-base AS build-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM build-deps AS runtime-deps
RUN pnpm prune --prod

FROM node-base AS builder
WORKDIR /app
COPY . .
COPY --from=build-deps /app/node_modules ./node_modules
RUN pnpm build

FROM gcr.io/distroless/nodejs:16 AS runner
WORKDIR /app

COPY --from=runtime-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV DATABASE_URL ${DATABASE_URL}

# Run app command
CMD ["./dist/index.js"]