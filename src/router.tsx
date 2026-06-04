import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
  });
}

let router: ReturnType<typeof createRouter>;

export const getRouter = () => {
  if (!router) {
    router = createRouter();
  }
  return router;
};

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
