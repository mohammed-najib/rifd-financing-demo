import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { NeutralStartup } from './ui/app'

export function getRouter() {
  return createRouter({ routeTree, scrollRestoration: true, defaultPendingComponent: NeutralStartup })
}
declare module '@tanstack/react-router' { interface Register { router: ReturnType<typeof getRouter> } }
