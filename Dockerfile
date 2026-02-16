FROM node:lts AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Runtime stage
FROM nginx:mainline-alpine-slim AS runtime
ENV ASTRO_TELEMETRY_DISABLED=true
COPY --from=base /app/dist /usr/share/nginx/html
EXPOSE 80
