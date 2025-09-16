import { createFileRoute } from '@tanstack/react-router'
import Cart from '../components/ui/pages/Cart'

export const Route = createFileRoute('/Cart')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Cart />;
}
