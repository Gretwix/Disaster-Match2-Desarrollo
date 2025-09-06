import { createFileRoute } from '@tanstack/react-router'
import Login from '../components/ui/pages/Login'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Login />;
}
