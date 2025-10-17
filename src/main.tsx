
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// initialize i18n early
import "./i18n";
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import Layout from './components/ui/Layout'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <StrictMode>
    <Layout>
      <RouterProvider router={router} />
    </Layout>
  </StrictMode>
);
