import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/patients/')({
  component: () => (
    <div>
      <h1>Patients Page</h1>
      <p>Welcome to the patients management area.</p>
    </div>
  ),
});
