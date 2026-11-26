FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN corepack enable \
    && corepack prepare pnpm@11.17.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY web/package.json ./web/

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN pnpm install --frozen-lockfile --filter miniaula-api...

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

COPY api ./api
COPY --from=build /app/api/node_modules ./api/node_modules
COPY --from=build /app/node_modules ./node_modules
COPY api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p /app/api/uploads/videos \
    && chmod +x /usr/local/bin/docker-entrypoint.sh \
    && chown -R node:node /app

USER node

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
