import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/report')({
  component: () => (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', height: '100vh' }}>
      <h2>📊 Relatórios Noosféricos</h2>
      <p>Os dados de Alta Integridade estão sendo processados...</p>
    </div>
  ),
})
