/**
 * Angular Dev-Server Proxy Configuration
 *
 * Intercepts any request from the browser to /api/* and forwards it
 * to the backend service before the browser ever needs to deal with
 * CORS headers.  The proxying happens server-side (Node → Spring Boot),
 * so from the browser's perspective both the Angular app and the API
 * live on the same origin (localhost:4200 in local dev).
 *
 * Target resolution:
 *   • Outside Docker  →  API_TARGET is unset  →  http://localhost:8080
 *   • Inside Docker compose dev  →  API_TARGET=http://backend:8080
 *     (Docker's embedded DNS resolves the service name "backend")
 *
 * Usage:
 *   npm start                          (local dev, backend on :8080)
 *   docker compose -f docker-compose.yml -f docker-compose.dev.yml up
 */

const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: process.env['API_TARGET'] || 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    logLevel: 'info',
  },
];

module.exports = PROXY_CONFIG;
