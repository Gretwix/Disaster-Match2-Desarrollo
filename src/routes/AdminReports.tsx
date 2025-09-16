import { createFileRoute } from '@tanstack/react-router'
import AdminReports from '../components/ui/pages/AdminReports'

export const Route = createFileRoute('/AdminReports')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminReports />;
}
