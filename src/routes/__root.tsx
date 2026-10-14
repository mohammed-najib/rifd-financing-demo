import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { NeutralStartup } from '../ui/app'
import stylesheet from '../ui/styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { title: 'رِفد / RIFD · Fictional financing demo' }],
    links: [{ rel: 'stylesheet', href: stylesheet }],
  }),
  component: () => <html lang="ar" dir="rtl"><head><HeadContent /></head><body><Outlet /><Scripts /></body></html>,
  pendingComponent: NeutralStartup,
})
