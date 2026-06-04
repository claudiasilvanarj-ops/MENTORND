import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/session/$patientId')({
  component: () => (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', height: '100vh' }}>
      <h2>🧘 Sessão de Harmonização</h2>
      <p>Iniciando protocolo de cura vibracional na Noosfera...</p>
    </div>
  ),
})
