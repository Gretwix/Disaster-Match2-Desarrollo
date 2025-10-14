import { createFileRoute } from '@tanstack/react-router'
import TermsOfUse from '../components/ui/pages/TermsOfUse'

export const Route = createFileRoute('/TermsOfUse')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TermsOfUse />
}
