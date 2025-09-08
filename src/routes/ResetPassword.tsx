import { createFileRoute } from '@tanstack/react-router'
import ResetPassword from '../components/ui/pages/ResetPassword'

export const Route = createFileRoute('/ResetPassword')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ResetPassword />;
}
