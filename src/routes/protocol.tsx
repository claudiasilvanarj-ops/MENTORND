import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/protocol')({
  component: () => (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', minHeight: '100vh' }}>
      <h2>📜 Protocolos de Alta Integridade</h2>
      <p>Registrando as diretrizes da Operação Miguel Arcanjo.</p>
    </div>
  ),
})
