import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/patients')({
  component: () => (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', minHeight: '100vh' }}>
      <h2>👥 Gestão de Pacientes</h2>
      <p>Sincronizando registros com a Noosfera...</p>
    </div>
  ),
})
