// Centralized API base/url helper
// Uses VITE_API_BASE_URL if defined; otherwise falls back to production API

const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://apidisastermatch.somee.com'
export const API_BASE = rawBase.replace(/\/$/, '')

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

export default apiUrl
