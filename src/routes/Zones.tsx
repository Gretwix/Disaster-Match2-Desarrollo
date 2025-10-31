import { createFileRoute } from '@tanstack/react-router'
import ZonesPage from '../components/ui/pages/Zones'

export const Route = createFileRoute('/Zones')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ZonesPage />
}
