import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'export function createRouter() {
return createTanStackRouter({
routeTree,
defaultPreload: 'intent',
})
}const router = createRouter()
export const getRouter = () => routerdeclare module '@tanstack/react-router' {
interface Register {
router: ReturnType
}
}
