import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/umbilical')({
  component: UmbilicalComponent,
});

function UmbilicalComponent() {
  return (
    <div className="p-4">
      <h1>Conexão Umbilical</h1>
      <p>Sincronizando frequências...</p>
    </div>
  );
}
