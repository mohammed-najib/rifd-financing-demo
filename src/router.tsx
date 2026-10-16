import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  // App owns startup feedback. Child matches must not add a second startup panel.
  return createRouter({ routeTree, scrollRestoration: true, defaultPendingComponent: () => null })
}
declare module '@tanstack/react-router' { interface Register { router: ReturnType<typeof getRouter> } }
