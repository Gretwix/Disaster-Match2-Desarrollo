import { createFileRoute } from '@tanstack/react-router'
import ContactForm from '../components/ui/pages/ContactForm';

export const Route = createFileRoute('/ContactForm')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ContactForm />;
}
