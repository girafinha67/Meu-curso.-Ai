import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './styles/global.css'

function ErrorScreen({ error }: { error: unknown }) {
  const err = error as Error
  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Algo deu errado</h1>
      <p style={{ color: '#b91c1c', marginTop: 8 }}>{err?.message ?? String(error)}</p>
      <pre style={{ marginTop: 12, fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{err?.stack}</pre>
    </div>
  )
}

const router = createRouter({ routeTree, defaultPreload: 'intent', defaultErrorComponent: ErrorScreen })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
