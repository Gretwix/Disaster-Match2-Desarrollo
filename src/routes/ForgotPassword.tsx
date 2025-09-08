import { createFileRoute } from '@tanstack/react-router'
import ForgotPassword from '../components/ui/pages/ForgotPassword'

export const Route = createFileRoute('/ForgotPassword')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ForgotPassword />;
}
