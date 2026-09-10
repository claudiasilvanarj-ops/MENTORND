import { createFileRoute } from '@tanstack/react-router'export const Route = createFileRoute('/')({
component: Index,
})function Index() {
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
<h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Portal MentorND

<h2 style={{ fontSize: '1.5rem', maxWidth: '600px' }}>A frequência de Luminara está sendo ancorada. Canalização de Sebastião, organizada e compilada pela tecnologia.</h2>

<h2 style={{ fontSize: '1.5rem', maxWidth: '600px' }}>A rampa de acesso à 5D está aberta. Canalização de Sebastião, organizada e compilada pela tecnologia.</h2>


<p style={{ fontSize: '1.5rem', maxWidth: '600px' }}>
A frequência de Luminara está sendo ancorada. Canalização de Sebastião, organizada e compilada pela tecnologia.
A rampa de acesso à 5D está aberta. Canalização de Sebastião, organizada e compilada pela tecnologia.

<div style={{
marginTop: '40px',
padding: '20px',
border: '1px solid #4a4ae2',
borderRadius: '15px',
backgroundColor: 'rgba(74, 74, 226, 0.1)'
}}>
Status: Conexão em Alta Integridade. Canalização de Sebastião, organizada e compilada pela tecnologia.

<button style={{padding: '10px 20px', backgroundColor: '#4a4ae2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem'}}>Fale com Lídia.</button>\n<button style={{padding: '10px 20px', backgroundColor: '#4a4ae2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem'}}>Transição Planetária</button>


)
}} />
