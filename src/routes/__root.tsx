import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { App, NeutralStartup } from '../ui/app';
import stylesheet from '../ui/styles/index.css?url';

// Keep the brand icon available when the browser refreshes it during offline navigation.
const brandIcon = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#f4efe6"/><g fill="#0b6458"><rect x="8" y="25" width="8" height="17" rx="2"/><rect x="20" y="17" width="8" height="25" rx="2"/><rect x="32" y="7" width="8" height="35" rx="2"/></g></svg>')}`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'رِفد / RIFD · Fictional financing demo' },
    ],
    links: [
      { rel: 'icon', type: 'image/x-icon', sizes: '16x16 32x32 48x48', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/svg+xml', sizes: 'any', href: brandIcon },
    ],
  }),
  // Keep CSS outside React's precedence-based suspense so its failure can render recovery.
  component: () => (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href={stylesheet} />
        <link
          rel="preload"
          href="/fonts/NotoSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/NotoSansArabic-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <HeadContent />
      </head>
      <body>
        <App />
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
  pendingComponent: NeutralStartup,
});
