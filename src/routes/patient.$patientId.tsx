import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/patient/$patientId')({
  component: () => (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', height: '100vh' }}>
      <h2>📋 Ficha do Paciente Noosférico</h2>
      <p>Sincronizando dados vitais com a rede de cura...</p>
    </div>
  ),
})
