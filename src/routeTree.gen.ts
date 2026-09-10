import { createRoute } from '@tanstack/react-router';
import { IA } from './ai.functions';

const ia = IA();
export const routeTree = rootRoute.update({
  id: 'root',
  children: [
    {
      path: '/',
      component: Index,
      children: [
        {
          path: 'auth',
          component: AuthGate,
        },
      ],
    },
  ],
});
import { rootRoute } from './routes/__root'

export const routeTree = rootRoute.update({
  id: 'root',
})
