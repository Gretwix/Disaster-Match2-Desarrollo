import { createFileRoute } from '@tanstack/react-router'
import Faq from '../components/ui/pages/Faq'

export const Route = createFileRoute('/Faq')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Faq />
}
