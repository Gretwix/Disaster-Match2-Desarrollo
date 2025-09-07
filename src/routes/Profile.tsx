import { createFileRoute } from '@tanstack/react-router'
import Profile from '../components/ui/pages/Profile';

export const Route = createFileRoute('/Profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Profile />;
}
