import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'

export const routeTree = rootRoute.update({
  id: 'root',
})
