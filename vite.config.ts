import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => ({
  cacheDir: 'node_modules/.vite/app',
  plugins: [tailwindcss(), tanstackStart({ spa: { enabled: true } }), react()],
  server: {
    watch: { ignored: ['**/artifacts/**', '**/test-results/**', '**/playwright-report/**'] },
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/artifacts/local-jev/**'] },
    ...(command === 'serve' &&
    mode === 'local-jev' &&
    /^http:\/\/127\.0\.0\.1:\d+$/.test(process.env.RIFD_LOCAL_JEV_TARGET ?? '')
      ? {
          proxy: {
            '/api/evidence-analysis': {
              target: process.env.RIFD_LOCAL_JEV_TARGET!,
              changeOrigin: false,
            },
            '/api/local-evidence-session': {
              target: process.env.RIFD_LOCAL_JEV_TARGET!,
              changeOrigin: false,
            },
          },
        }
      : {}),
  },
}));
