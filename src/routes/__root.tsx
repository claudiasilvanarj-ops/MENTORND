import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('__root__')({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});
