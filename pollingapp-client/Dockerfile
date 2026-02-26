# ==============================================================================
# Stage 1 – dependency cache
#
# Installs node_modules using the exact versions in package-lock.json (npm ci).
# Docker only re-runs this when package-lock.json is modified, so rebuilds
# after source-only changes skip the whole npm install step entirely.
# ==============================================================================
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ==============================================================================
# Stage 2 – development
#
# Starts the Angular dev-server (ng serve) with:
#   • --host 0.0.0.0  – binds to all interfaces so Docker can forward port 4200
#   • --poll 500       – filesystem polling (necessary when source is a volume
#                        mount from a Windows/macOS host whose inotify events
#                        don't cross the Docker bridge reliably)
#
# The API_TARGET env var is read by src/proxy.conf.js and forwarded to the
# backend container by name ("backend") via Docker's internal DNS.
#
# Volume mounts in docker-compose.dev.yml:
#   ./pollingapp-client/src → /app/src          (hot-reloaded source)
#   node_modules anonymous volume               (keeps container's node_modules
#                                                independent from host)
# ==============================================================================
FROM deps AS development
COPY . .
EXPOSE 4200
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "500", \
     "--proxy-config", "src/proxy.conf.js"]

# ==============================================================================
# Stage 3 – builder (production compile)
#
# Produces the production-optimised static bundle.
# ng build --configuration production enables:
#   • Ahead-of-Time (AoT) compilation
#   • Tree-shaking / dead-code elimination
#   • Output hashing (cache-busting file names)
#
# Output lands in dist/pollingapp-client/browser/ – the path nginx will serve.
# ==============================================================================
FROM deps AS builder
COPY . .
RUN npx ng build --configuration production

# ==============================================================================
# Stage 4 – production runtime
#
# nginx:alpine (~45 MB) serves the static files.  The custom nginx.conf (next
# to this Dockerfile) does two things:
#   1. Serves the Angular SPA, falling back all unknown paths to index.html
#      so that client-side routing works correctly after a hard refresh.
#   2. Reverse-proxies /api/* to the "backend" service, which means the browser
#      never makes a cross-origin request – CORS is not required in production.
#
# To migrate to a real server:
#   • For HTTPS: add a Certbot/Let's Encrypt sidecar or terminate TLS at the
#     load balancer / CDN (preferred for public deployments).
#   • Replace "backend" in nginx.conf with the real DNS name or IP of the API.
# ==============================================================================
FROM nginx:alpine AS production
COPY --from=builder /app/dist/pollingapp-client/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
