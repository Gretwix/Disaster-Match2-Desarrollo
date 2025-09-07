import { createFileRoute } from '@tanstack/react-router'
import HomePage from '../components/ui/pages/HomePage';

export const Route = createFileRoute('/HomePage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <HomePage />;
}
