import js from '@eslint/js'
import ts from 'typescript-eslint'

export default ts.config(
  { ignores: ['**/dist/**', 'public/pdfjs/**', '.output/**', '.tanstack/**', '.agents/**', '.scratch/**', 'src/routeTree.gen.ts', 'test-results/**', 'playwright-report/**', 'artifacts/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  { files: ['**/*.mjs'], languageOptions: { globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly', URL: 'readonly' } } },
)
