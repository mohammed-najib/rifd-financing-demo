import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { App, NeutralStartup } from '../ui/app'
import stylesheet from '../ui/styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { title: 'رِفد / RIFD · Fictional financing demo' }],
  }),
  // Keep CSS outside React's precedence-based suspense so its failure can render recovery.
  component: () => <html lang="ar" dir="rtl"><head><link rel="stylesheet" href={stylesheet} /><link rel="preload" href="/fonts/NotoSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /><link rel="preload" href="/fonts/NotoSansArabic-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /><HeadContent /></head><body><App /><Outlet /><Scripts /></body></html>,
  pendingComponent: NeutralStartup,
})
