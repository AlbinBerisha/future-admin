# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1 — build the Vite/React app
# =============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# The app calls same-origin /api (nginx reverse-proxies to the backend), so no
# API URL is baked into the bundle — one image works in every environment.

# Install dependencies as a cached layer (only re-runs when the lockfile changes).
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# =============================================================================
# Stage 2 — serve the static build with nginx
# =============================================================================
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

# nginx config is a template: the official nginx entrypoint renders it at start,
# substituting ${API_UPSTREAM} from the environment (default targets the compose
# `api` service). Override per environment via compose `environment:`.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV API_UPSTREAM=http://api:8085

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
