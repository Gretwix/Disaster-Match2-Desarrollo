import { API_BASE } from './api'

export type ZoneInterest = {
  ID: number
  user_id: number
  state?: string
  city?: string
  zip?: string
  address_contains?: string
  email_to?: string
  created_at: string
}

export type AddZonePayload = {
  user_id: number
  state?: string
  city?: string
  zip?: string
  address_contains?: string
  email_to?: string
}

async function parseError(res: Response): Promise<never> {
  let detail = ''
  try {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const j = await res.json()
      detail = typeof j === 'string' ? j : JSON.stringify(j)
    } else {
      detail = await res.text()
    }
  } catch {
    // ignore
  }
  const msg = `${res.status} ${res.statusText}${detail ? ` - ${detail.slice(0, 500)}` : ''}`
  throw new Error(msg)
}

function normalizeZone(raw: any): ZoneInterest {
  const ID = Number(raw?.ID ?? raw?.id ?? raw?.Id)
  const user_id = Number(raw?.user_id ?? raw?.userId ?? raw?.UserId)
  return {
    ID,
    user_id,
    state: raw?.state ?? raw?.State ?? undefined,
    city: raw?.city ?? raw?.City ?? undefined,
    zip: raw?.zip ?? raw?.Zip ?? undefined,
    address_contains:
      raw?.address_contains ?? raw?.addressContains ?? raw?.AddressContains ?? undefined,
    email_to: raw?.email_to ?? raw?.emailTo ?? raw?.EmailTo ?? undefined,
    created_at: raw?.created_at ?? raw?.createdAt ?? raw?.CreatedAt ?? new Date().toISOString(),
  }
}

export async function listMyZones(userId: number): Promise<ZoneInterest[]> {
  const res = await fetch(`${API_BASE}/Zones/My?userId=${encodeURIComponent(String(userId))}`)
  if (!res.ok) return parseError(res)
  const data = await res.json()
  return Array.isArray(data) ? data.map(normalizeZone) : []
}

export async function addZone(payload: AddZonePayload): Promise<ZoneInterest> {
  const res = await fetch(`${API_BASE}/Zones/Add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return parseError(res)
  const data = await res.json()
  return normalizeZone(data)
}

export type AddZoneResult = { zone: ZoneInterest; initialNotified?: number }

export async function addZoneWithMeta(payload: AddZonePayload): Promise<AddZoneResult> {
  const res = await fetch(`${API_BASE}/Zones/Add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return parseError(res)
  const data = await res.json()
  const zone = normalizeZone(data)
  const header = res.headers.get('X-Initial-Notified') ?? res.headers.get('x-initial-notified')
  const initialNotified = header ? Number(header) : undefined
  return { zone, initialNotified: Number.isFinite(initialNotified) ? initialNotified : undefined }
}

export async function deleteZoneById(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/Zones/Delete/${encodeURIComponent(String(id))}`, { method: 'DELETE' })
  if (!res.ok) return parseError(res)
}

export async function triggerScrape(): Promise<void> {
  const res = await fetch(`${API_BASE}/Leads/ScrapeWithPlaywright`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Username: 'x', Password: 'x' }),
  })
  if (!res.ok) return parseError(res)
}

export async function testEmail(to: string): Promise<void> {
  const url = `${API_BASE}/Zones/TestEmail?to=${encodeURIComponent(to)}`
  const res = await fetch(url, { method: 'POST' })
  if (!res.ok) return parseError(res)
}
