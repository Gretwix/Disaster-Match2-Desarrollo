// Centralized API base/url helper
// Uses VITE_API_BASE_URL if defined; otherwise falls back to production API

// Default to a relative "/api" so production uses Netlify proxy. Override with VITE_API_BASE_URL if provided.
let configured = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api'
// Prevent mixed content: if running under https and configured base is http, use the proxy instead
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && configured.startsWith('http://')) {
  configured = '/api'
}
export const API_BASE = configured.replace(/\/$/, '')

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

export default apiUrl
