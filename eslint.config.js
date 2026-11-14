import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Import boundaries (CLAUDE.md "Architecture"): Supabase is reached only through src/services, the
// shared layers never depend on a feature, and nothing below a page imports one.
const SUPABASE_CLIENT = {
  name: '@/lib/supabase',
  importNames: ['default'],
  message: 'Reach Supabase through a function in src/services (realtime channels: openChannel in services/realtime.js).',
}
const NO_FEATURES = {
  group: ['@/features/*'],
  message: 'Shared code must not depend on a feature: move it into the feature, or pass it in as a prop.',
}
const NO_PAGES = {
  group: ['@/pages/*', '@/layout/*'],
  message: 'Pages and layouts put features together; features and shared code never import them.',
}
const NO_UI = {
  group: ['react', 'react-dom', '@tanstack/react-query', 'react-hot-toast', '@/components/*', '@/hooks/*'],
  message: 'Services are plain async functions with no React: call them from a hook.',
}
// One rule entry per file group: a later group replaces an earlier one's options, so each lists all of its own
const boundaries = (paths, patterns) => ({ 'no-restricted-imports': ['error', { paths, patterns }] })

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
  {
    files: ['src/**/*.{js,jsx}'],
    rules: boundaries([SUPABASE_CLIENT], []),
  },
  {
    files: ['src/features/**/*.{js,jsx}'],
    rules: boundaries([SUPABASE_CLIENT], [NO_PAGES]),
  },
  {
    files: ['src/{components,hooks,utils}/**/*.{js,jsx}'],
    rules: boundaries([SUPABASE_CLIENT], [NO_FEATURES, NO_PAGES]),
  },
  {
    // MediaRow and MediaCard show and toggle the user's favorites and watchlist on every card. Passing
    // that state in would touch every row's caller, so this is the one shared folder that may use a feature.
    files: ['src/components/media/**/*.{js,jsx}'],
    rules: boundaries([SUPABASE_CLIENT], [{ ...NO_FEATURES, group: ['@/features/*', '!@/features/interactions'] }, NO_PAGES]),
  },
  {
    files: ['src/lib/**/*.js'],
    rules: boundaries([], [NO_FEATURES, NO_PAGES]),
  },
  {
    files: ['src/services/**/*.js'],
    rules: boundaries([], [NO_FEATURES, NO_PAGES, NO_UI]),
  },
])
