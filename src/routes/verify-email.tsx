import { createFileRoute } from '@tanstack/react-router'
import VerifyEmail from '../components/ui/pages/VerifyEmail'

export const Route = createFileRoute('/verify-email')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VerifyEmail />
}
