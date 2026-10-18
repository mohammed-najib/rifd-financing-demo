import { build } from 'esbuild'

await build({
  entryPoints: ['functions/index.ts'], outfile: 'functions/dist/index.cjs', bundle: true, platform: 'node', target: 'node22', format: 'cjs',
  external: ['firebase-admin/*', 'firebase-functions/*'], logLevel: 'warning',
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '__moduleUrl' },
  banner: { js: 'const __moduleUrl = require("node:url").pathToFileURL(__filename).href;' },
  // debug:false silences logging, but TanStack still emits devtools events.
  // Remove that transport entirely from the deployed function.
  plugins: [{ name: 'disable-ai-devtools', setup(context) {
    context.onResolve({ filter: /^@tanstack\/ai-event-client$/ }, () => ({ path: 'disabled', namespace: 'no-devtools' }))
    context.onLoad({ filter: /.*/, namespace: 'no-devtools' }, () => ({ contents: 'export const aiEventClient = { emit() {} }; export const devtoolsMiddleware = () => ({});', loader: 'js' }))
  } }],
})
await build({ entryPoints: ['src/live-assistance/crop-worker.mjs'], outfile: 'functions/dist/crop-worker.mjs', bundle: true, platform: 'node', target: 'node22', format: 'esm', logLevel: 'warning' })
