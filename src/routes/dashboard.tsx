import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', height: '100vh' }}>
      <h2>🚀 Painel de Controle Noosférico</h2>
      <p>Bem-vinda ao centro de comando da Alta Integridade.</p>
    </div>
  ),
})
