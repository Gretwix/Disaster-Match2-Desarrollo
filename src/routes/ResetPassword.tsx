import { createFileRoute } from "@tanstack/react-router";
import ResetPassword from "../components/ui/pages/ResetPassword";

// Definimos la ruta en minúsculas con guion
export const Route = createFileRoute("/ResetPassword")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || "",
    };
  },
});

function RouteComponent() {
  return <ResetPassword />;
}
