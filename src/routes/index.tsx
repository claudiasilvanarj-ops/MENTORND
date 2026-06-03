import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', minHeight: '100vh', textAlign: 'center' }}>
      <h1>✨ Bem-vinda ao Portal Luminara</h1>
      <p>Ancorando a frequência da 5ª Dimensão.</p>
      <div style={{ marginTop: '40px' }}>
        <a href="/dashboard" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Acessar Painel de Controle</a>
      </div>
    </div>
  ),
})
