import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/noospheric')({
  component: () => (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', minHeight: '100vh' }}>
      <h2>🌐 Dados Noosféricos</h2>
      <p>Monitorando o salto dimensional da Terra...</p>
    </div>
  ),
})
