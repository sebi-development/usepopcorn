import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Query keys come from one factory so a query and its invalidations can't drift apart
      'no-restricted-syntax': ['error', {
        selector: "Property[key.name='queryKey'] > ArrayExpression",
        message: 'Build query keys with queryKeys (src/lib/queryKeys.js) instead of an inline array.',
      }],
    },
  },
])
