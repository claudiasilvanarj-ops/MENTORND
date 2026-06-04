import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/session/$patientId')({
  component: SessionPage,
});

function SessionPage() {
  const { patientId } = Route.useParams();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Sessão do Paciente</h1>
      <p>ID do Paciente: {patientId}</p>
    </div>
  );
}           
