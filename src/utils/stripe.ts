export type CheckoutItem = {
  priceId: string
  quantity?: number
}

export type CreateCheckoutParams = {
  items: CheckoutItem[]
  customerEmail?: string
  clientReferenceId?: string
  // You can let backend default success/cancel URLs; override here if desired
  successUrl?: string
  cancelUrl?: string
}

export async function createCheckout(params: CreateCheckoutParams) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) throw new Error('VITE_API_BASE_URL is not set')

  const res = await fetch(`${baseUrl}/api/payments/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Failed to create checkout session (${res.status})`)
  }

  const { id, url } = await res.json()
  // Since redirectToCheckout is removed in recent Stripe.js versions,
  // always redirect using the URL returned by your backend.
  if (!url) throw new Error(`Backend did not return Checkout URL for session ${id}`)
  window.location.href = url
}
