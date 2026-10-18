import { build } from 'esbuild'

await build({ entryPoints: ['functions/index.ts'], outfile: 'functions/dist/index.cjs', bundle: true, platform: 'node', target: 'node22', format: 'cjs', external: ['firebase-admin/*', 'firebase-functions/*'], logLevel: 'warning' })
