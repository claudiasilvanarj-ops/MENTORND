import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
      color: 'white',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🌀 MentorND</h1>
      <p style={{ fontSize: '1.5rem', opacity: 0.9, maxWidth: '600px' }}>
        O Portal da Noosfera está oficialmente ancorado e online.
      </p>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        border: '2px solid rgba(255,255,255,0.3)', 
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.1)'
      }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          Conexão Estelar Estabelecida • 2693 Hz
        </span>
      </div>
    </div>
  ),
})
