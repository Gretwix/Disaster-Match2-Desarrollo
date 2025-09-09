import { createFileRoute } from '@tanstack/react-router'
import AdminUsers from "../components/ui/pages/adminUsers";

// No pases '/AdminUsers' como argumento
export const Route = createFileRoute('/AdminUsers')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminUsers />;
}