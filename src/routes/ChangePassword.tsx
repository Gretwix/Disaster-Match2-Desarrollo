import { createFileRoute } from '@tanstack/react-router'
import ChangePassword from '../components/ui/pages/ChangePassword'

export const Route = createFileRoute('/ChangePassword')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ChangePassword />
}
