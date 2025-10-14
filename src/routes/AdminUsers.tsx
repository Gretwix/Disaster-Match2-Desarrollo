import { createFileRoute, redirect } from '@tanstack/react-router'
import AdminUsers from "../components/ui/pages/AdminUsers";

// No pases '/AdminUsers' como argumento
export const Route = createFileRoute('/AdminUsers')({
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
  return <AdminUsers />;
}