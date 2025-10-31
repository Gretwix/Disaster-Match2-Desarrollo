/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast, { Toaster } from 'react-hot-toast'
import { getLoggedUser } from '../../../utils/storage'
import { addZoneWithMeta, deleteZoneById, listMyZones, triggerScrape, testEmail, type ZoneInterest } from '../../../utils/zones'
import { ArrowLeft } from 'react-feather'
import { useNavigate } from '@tanstack/react-router'

export default function ZonesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logged = getLoggedUser() as any
  const userId = (logged?.id ?? logged?.ID) as number | undefined

  const [loading, setLoading] = useState(true)
  const [zones, setZones] = useState<ZoneInterest[]>([])
  const [form, setForm] = useState({ state: '', city: '', zip: '', address_contains: '', email_to: '' })
  const canSubmit = useMemo(() => {
    return !!(form.state.trim() || form.city.trim() || form.zip.trim() || form.address_contains.trim())
  }, [form])

  useEffect(() => {
    const run = async () => {
      if (!userId) { setLoading(false); return }
      try {
        const data = await listMyZones(userId)
        setZones(data)
      } catch (e) {
        console.error(e)
        toast.error(t('zones.loadError', 'Could not load your zones'))
      } finally {
        setLoading(false)
      }
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (!userId) {
    return (
      <div className="mx-auto max-w-5xl p-4">
        <Toaster position="top-right" />
        <p className="text-center mt-10 text-gray-600">{t('zones.mustLogin', 'You must be logged in to manage zones.')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b1220] overflow-x-hidden">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl bg-white dark:bg-[#0f172a] shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
            <button onClick={() => navigate({ to: '/' })} className="text-indigo-600 hover:text-indigo-800 flex items-center">
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>{t('contactForm.back', 'Back')}</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">
              {t('zones.title', 'Zones of Interest')}
            </h1>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">
              {t('zones.subtitle', 'Add filters below to be notified when new incidents match. All non-empty fields must match.')}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {([
                { key: 'state', label: t('zones.state', 'State'), ph: t('zones.statePlaceholder', 'AZ') },
                { key: 'city', label: t('zones.city', 'City'), ph: t('zones.cityPlaceholder', 'Phoenix') },
                { key: 'zip', label: t('zones.zip', 'ZIP'), ph: t('zones.zipPlaceholder', '85001') },
                { key: 'address_contains', label: t('zones.addressContains', 'Address contains'), ph: t('zones.addressContainsPlaceholder', 'Main St') },
                { key: 'email_to', label: t('zones.emailTo', 'Email to (optional)'), ph: t('zones.emailToPlaceholder', 'leave empty to use your account email') },
              ] as const).map((f) => (
                <label key={f.key} className="flex flex-col text-sm font-medium">
                  {f.label}
                  <input
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={String(f.ph)}
                    className="mt-1 border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </label>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  try {
                    if (!canSubmit) {
                      toast.error(t('zones.validation', 'Provide at least one filter (state, city, zip, or address)'))
                      return
                    }
                    const { zone: created, initialNotified } = await addZoneWithMeta({
                      user_id: userId,
                      state: form.state || undefined,
                      city: form.city || undefined,
                      zip: form.zip || undefined,
                      address_contains: form.address_contains || undefined,
                      email_to: form.email_to?.trim() || undefined,
                    })
                    setZones((prev) => [created, ...prev])
                    setForm({ state: '', city: '', zip: '', address_contains: '', email_to: '' })
                    if (typeof initialNotified === 'number') {
                      toast.success(t('zones.addedWithCount', { defaultValue: 'Zone added. Initial digest emailed for {{count}} matching leads.', count: initialNotified }))
                    } else {
                      toast.success(t('zones.added', 'Zone added. If matches exist, an initial email will arrive shortly.'))
                    }
                  } catch (e) {
                    console.error(e)
                    toast.error(t('zones.addError', 'Could not add zone'))
                  }
                }}
                className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition text-sm sm:text-base ${canSubmit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
                disabled={!canSubmit}
              >
                {t('zones.add', 'Add zone')}
              </button>

              <button
                onClick={async () => {
                  try {
                    await triggerScrape()
                    toast.success(t('zones.scrapeTriggered', 'Scrape triggered. New matching incidents will email you.'))
                  } catch (e) {
                    console.error(e)
                    toast.error(t('zones.scrapeError', 'Failed to trigger scrape'))
                  }
                }}
                className="px-4 py-2 rounded-lg text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition text-sm sm:text-base"
              >
                {t('zones.triggerScrape', 'Trigger scraping (test)')}
              </button>

              <button
                onClick={async () => {
                  try {
                    const to = form.email_to?.trim() || (logged?.email as string | undefined)
                    if (!to) {
                      toast.error(t('zones.testEmailMissing', 'Enter an email in the Email to field first.'))
                      return
                    }
                    await testEmail(to)
                    toast.success(t('zones.testEmailSent', { defaultValue: 'Test email sent to {{to}}', to }))
                  } catch (e) {
                    console.error(e)
                    toast.error(t('zones.testEmailError', 'Failed to send test email'))
                  }
                }}
                className="px-4 py-2 rounded-lg text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition text-sm sm:text-base"
              >
                {t('zones.sendTestEmail', 'Send test email')}
              </button>
            </div>

            <div className="mt-6">
              {loading ? (
                <p className="text-gray-500">{t('zones.loading', 'Loading zones...')}</p>
              ) : zones.length === 0 ? (
                <p className="text-gray-500">{t('zones.empty', 'No zones added yet')}</p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-slate-700 rounded-md border border-gray-200 dark:border-slate-700 overflow-hidden">
                  {zones.map((z) => (
                    <li key={z.ID} className="p-4 flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-slate-100">
                          {[z.city, z.state, z.zip].filter(Boolean).join(', ') || t('zones.anywhere', 'Anywhere')}
                        </p>
                        <p className="text-gray-600 dark:text-slate-300">
                          {z.address_contains ? t('zones.contains', { text: z.address_contains, defaultValue: 'Contains: {{text}}' }) : ''}
                        </p>
                        {z.email_to && (
                          <p className="text-xs text-indigo-700 bg-indigo-50 inline-block mt-1 px-2 py-0.5 rounded border border-indigo-200">
                            {t('zones.emailToLabel', 'Email:')} {z.email_to}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await deleteZoneById(z.ID)
                            setZones((prev) => prev.filter((x) => x.ID !== z.ID))
                            toast.success(t('zones.deleted', 'Zone removed'))
                          } catch (e) {
                            console.error(e)
                            toast.error(t('zones.deleteError', 'Could not remove zone'))
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        {t('zones.remove', 'Remove')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
