import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: () => (
    <div style={{ 
      height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', 
      background: '#0f172a', color: 'white', fontFamily: 'sans-serif' 
    }}>
      <div style={{ padding: '40px', border: '1px solid #334155', borderRadius: '12px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>Acesso ao Portal</h2>
        <input type="password" placeholder="Chave Noosférica" style={{ padding: '10px', borderRadius: '4px', border: 'none', marginBottom: '10px', width: '100%' }} />
        <button style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
          Entrar
        </button>
      </div>
    </div>
  ),
})
