import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/umbilical')({
  component: UmbilicalComponent,
});

function UmbilicalComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <h1 className="text-xl font-medium">🌀 Sincronizando frequências...</h1>
    </div>
  );
}
