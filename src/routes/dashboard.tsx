import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: () => <div>Painel de Controle Noosférico</div>,
});
