// @ts-nocheck
import { createFileRoute, useRouter, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { getCart, getLoggedUser, CART_KEY } from '../../utils/storage'

export const Route = createFileRoute('/checkout/success')({
  component: SuccessPage,
})

function SuccessPage() {
  const { history } = useRouter()
  const navigate = useNavigate()
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [message, setMessage] = React.useState<string>('')

  type CartItem = { id: number; title: string; price: number; quantity?: number }

  React.useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    setSessionId(sp.get('session_id'))
  }, [])

  React.useEffect(() => {
    const process = async () => {
      if (!sessionId) return
      const processedKey = `stripeSessionProcessed_${sessionId}`
      if (localStorage.getItem(processedKey)) {
        setStatus('success')
        setMessage('Purchase already processed.')
        setTimeout(() => navigate({ to: '/Profile' }), 2500)
        return
      }

      try {
        setStatus('processing')
        setMessage('Finalizing your purchase...')

        const cartItems = getCart<CartItem[]>() || []
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
          setStatus('success')
          setMessage('Nothing to record. Redirecting...')
          setTimeout(() => navigate({ to: '/Profile' }), 2000)
          return
        }

        const leadIds = cartItems.map((i) => i.id)
        const query = leadIds.map((id) => `leadIds=${id}`).join('&')

        const loggedUser = getLoggedUser()
        const userId = (loggedUser as any)?.id ?? (loggedUser as any)?.ID ?? 0
        const total = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0)
        const purchase = { user_id: userId, amount: total }

        const token = localStorage.getItem('authToken')
  const base = import.meta.env.VITE_API_BASE_URL || 'http://apidisastermatch.somee.com'
        const resp = await fetch(`${base}/Purchase/Create?${query}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(purchase),
        })

        if (!resp.ok) {
          const errText = await resp.text().catch(() => '')
          throw new Error(errText || `Error creating purchase (${resp.status})`)
        }

        // Clear cart and mark session as processed
        localStorage.removeItem(CART_KEY)
        localStorage.setItem(processedKey, 'true')

        setStatus('success')
        setMessage('Purchase recorded! Redirecting to your profile...')
        setTimeout(() => navigate({ to: '/Profile' }), 2500)
      } catch (e: any) {
        console.error(e)
        setStatus('error')
        setMessage(e?.message || 'Could not finalize your purchase')
      }
    }

    process()
  }, [sessionId, navigate])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Payment successful</h1>
      <p className="text-gray-700">Thanks for your purchase.</p>
      {sessionId && (
        <p className="text-sm text-gray-500 mt-2">Session: {sessionId}</p>
      )}
      <div className="mt-4 text-sm">
        {status === 'processing' && (
          <p className="text-gray-700">{message || 'Processing...'}</p>
        )}
        {status === 'success' && (
          <p className="text-green-700">{message || 'Done!'}</p>
        )}
        {status === 'error' && (
          <p className="text-red-700">{message || 'Something went wrong.'}</p>
        )}
      </div>
      <div className="mt-6">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          onClick={() => history.back()}
        >
          Go back
        </button>
      </div>
    </div>
  )
}
