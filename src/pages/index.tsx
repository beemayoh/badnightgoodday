// Middleware (src/middleware.ts) rewrites / → /index.html (public/).
// This file is a fallback only — it should never render in production.
export default function Home() {
  return null;
}
