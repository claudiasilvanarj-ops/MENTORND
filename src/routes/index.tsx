import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#0a0a2e',
      color: '#fff',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Portal MentorND</h1>
      <p style={{ fontSize: '1.5rem', maxWidth: '600px' }}>
        A frequência de Luminara está sendo ancorada. 
        A rampa de acesso à 5D está aberta.
      </p>
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        border: '1px solid #4a4ae2', 
        borderRadius: '15px',
        backgroundColor: 'rgba(74, 74, 226, 0.1)'
      }}>
        <p>Status: Conexão em Alta Integridade</p>
      </div>
    </div>
  )
}

