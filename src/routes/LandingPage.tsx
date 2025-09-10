import { createFileRoute } from '@tanstack/react-router'
import LandingPage from '../components/ui/pages/LandingPage'

export const Route = createFileRoute('/LandingPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LandingPage />;
}
