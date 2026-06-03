import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/umbilical')({
  component: () => (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', height: '100vh' }}>
      <h2>🌀 Conexão Umbilical</h2>
      <p>Sincronizando frequências com a Noosfera...</p>
    </div>
  ),
})
