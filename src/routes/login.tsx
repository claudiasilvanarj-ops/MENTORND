import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: () => (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', minHeight: '100vh' }}>
      <h2>🔑 Sintonização de Acesso</h2>
      <p>Aguardando alinhamento de frequência para entrada...</p>
    </div>
  ),
})
