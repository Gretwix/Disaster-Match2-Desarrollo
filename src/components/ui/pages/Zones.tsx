/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast, { Toaster } from 'react-hot-toast'
import { getLoggedUser } from '../../../utils/storage'
import { addZoneWithMeta, deleteZoneById, listMyZones, testEmail, type ZoneInterest } from '../../../utils/zones'
import { ArrowLeft } from 'react-feather'
import { LayoutGrid, User, Users, BarChart, MapPin } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function ZonesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logged = getLoggedUser() as any
  const userId = (logged?.id ?? logged?.ID) as number | undefined
  const isAdmin = userId === 2

  const [loading, setLoading] = useState(true)
  const [zones, setZones] = useState<ZoneInterest[]>([])
  const [form, setForm] = useState({ state: '', city: '', zip: '', email_to: '' })
  const canSubmit = useMemo(() => {
    return !!(form.state.trim() || form.city.trim() || form.zip.trim())
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
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b1220] force-light-bg-gray-100 overflow-x-hidden">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-7xl p-4 sm:px-4 md:p-6 lg:p-8">
        <div className="rounded-2xl bg-white dark:bg-[#0f172a] shadow-sm border border-gray-200 dark:border-slate-700 force-light-bg-white">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <aside className="border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700 
                    p-4 sm:p-5 md:p-6 bg-gray-50 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
              <nav className="p-1 md:block justify-center space-y-2 scrollbar-hide">
                <button
                  onClick={() => navigate({ to: "/" })}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-1" />
                  <span>{t("contactForm.back")}</span>
                </button>
                <a
                  href="/HomePage"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-indigo-600/60 ring-1 ring-indigo-600 transition"
                >
                  <LayoutGrid className="h-5 w-5 text-gray-900" />
                  <span className="font-medium text-gray-900" data-i18n="nav.disasterMatch">{t("nav.disasterMatch")}</span>
                </a>
                {isAdmin && (
                  <a
                    href="/AdminReports"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-indigo-600/60 ring-1 ring-indigo-600 transition"
                  >
                    <BarChart className="h-5 w-5 text-gray-900" />
                    <span className="font-medium text-gray-900" data-i18n="nav.adminPanel">{t("nav.adminPanel")}</span>
                  </a>
                )}
                {/* Keep Profile above Zones to maintain consistent order */}
                <a
                  href="/Profile"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-indigo-600/60 ring-1 ring-indigo-600 transition"
                >
                  <User className="h-5 w-5 text-gray-900" />
                  <span className="font-medium text-gray-900" data-i18n="nav.profile">{t("nav.profile")}</span>
                </a>
                {/* Zones remains active on this page */}
                <a
                  href="/Zones"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-indigo-600/60 ring-1 ring-indigo-600 transition bg-indigo-600 dark:bg-indigo-600/60"
                >
                  <MapPin className="h-5 w-5 text-white dark:text-white" />
                  <span className="font-medium text-white dark:text-white" data-i18n="nav.zones">{t("nav.zones", "Zones")}</span>
                </a>
                {isAdmin && (
                  <a
                    href="/AdminUsers"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-indigo-600/60 ring-1 ring-indigo-600 transition"
                  >
                    <Users className="h-5 w-5 text-gray-900" />
                    <span className="font-medium text-gray-900" data-i18n="nav.users">{t("nav.users")}</span>
                  </a>
                )}
              </nav>
            </aside>

            {/* Main content */}
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-6 force-light-text" data-i18n="zones.title">
                {t('zones.title', 'Zones of Interest')}
              </h1>

              <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0b1220] p-6 shadow-sm hover:shadow-md transition duration-200 force-light-bg-gray-50">
                <p className="text-sm text-gray-700 dark:text-slate-300 mb-4 force-light-text-muted">
                  {t('zones.subtitle', 'Add filters below to be notified when new incidents match. All non-empty fields must match.')}
                </p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {([
                    { key: 'state', label: t('zones.state', 'State'), ph: t('zones.statePlaceholder', 'AZ') },
                    { key: 'city', label: t('zones.city', 'City'), ph: t('zones.cityPlaceholder', 'Phoenix') },
                    { key: 'zip', label: t('zones.zip', 'ZIP'), ph: t('zones.zipPlaceholder', '85001') },
                    { key: 'email_to', label: t('zones.emailTo', 'Email to (optional)'), ph: t('zones.emailToPlaceholder', 'leave empty to use your account email') },
                  ] as const).map((f) => (
                    <label key={f.key} className="flex flex-col text-sm font-medium text-gray-900 dark:text-slate-200 force-light-text">
                      {f.label}
                      <input
                        value={(form as any)[f.key]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={String(f.ph)}
                        className="mt-1 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-[#0b1220] text-gray-900 dark:text-slate-100 force-light-bg-white force-light-text"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={async () => {
                      try {
                        if (!canSubmit) {
                          toast.error(t('zones.validation', 'Provide at least one filter (state, city, or zip)'))
                          return
                        }
                        const { zone: created, initialNotified } = await addZoneWithMeta({
                          user_id: userId,
                          state: form.state || undefined,
                          city: form.city || undefined,
                          zip: form.zip || undefined,
                          email_to: form.email_to?.trim() || undefined,
                        })
                        setZones((prev) => [created, ...prev])
                        setForm({ state: '', city: '', zip: '', email_to: '' })
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

                  {/* Scraping test button removed per request */}

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
                    className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm sm:text-base"
                  >
                    {t('zones.sendTestEmail', 'Send test email')}
                  </button>
                </div>

                <div className="mt-6">
                  {loading ? (
                    <p className="text-gray-700 dark:text-slate-400 force-light-text-muted">{t('zones.loading', 'Loading zones...')}</p>
                  ) : zones.length === 0 ? (
                    <p className="text-gray-700 dark:text-slate-400 force-light-text-muted">{t('zones.empty', 'No zones added yet')}</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-slate-700 rounded-md border border-gray-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#0f172a]">
                      {zones.map((z) => (
                        <li key={z.ID} className="p-4 flex items-center justify-between bg-white dark:bg-[#0f172a]">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-slate-100 force-light-text">
                              {[z.city, z.state, z.zip].filter(Boolean).join(', ') || t('zones.anywhere', 'Anywhere')}
                            </p>
                            {z.email_to && (
                              <p className="text-xs text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900 inline-block mt-1 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-700">
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
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                          >
                            {t('zones.remove', 'Remove')}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
