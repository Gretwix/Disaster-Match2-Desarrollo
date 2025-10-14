import { createFileRoute, redirect } from '@tanstack/react-router'
import AdminReports from '../components/ui/pages/AdminReports'

export const Route = createFileRoute('/AdminReports')({
  beforeLoad: () => {
    try {
      const raw = localStorage.getItem('loggedUser')
      const user = raw ? JSON.parse(raw) : null
      if (user?.role !== 'admin') {
        throw redirect({ to: '/' })
      }
    } catch {
      throw redirect({ to: '/' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminReports />;
}
