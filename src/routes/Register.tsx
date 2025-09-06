import { createFileRoute } from '@tanstack/react-router'
import Register from '../components/ui/pages/Register'

export const Route = createFileRoute('/Register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Register />;
}
