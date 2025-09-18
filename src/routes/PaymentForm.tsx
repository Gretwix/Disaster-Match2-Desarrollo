import { createFileRoute } from '@tanstack/react-router'
import PaymentForm from '../components/ui/pages/PaymentForm'

export const Route = createFileRoute('/PaymentForm')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PaymentForm />;
}
