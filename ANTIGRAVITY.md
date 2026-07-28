# Antigravity Agent Guidelines

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS v4, TanStack Query v5.
- Architecture: Feature-based folder structure (`src/features/...`).
- Database & Auth: Supabase.

## Engineering Rules
1. State Management: Rely on TanStack Query (`useQuery`, `useMutation`). Set explicit `staleTime` (e.g., 1 hour) to minimize API/DB overhead.
2. Performance: Prevent unnecessary re-renders using `React.memo` for presentation components, `useCallback` for passed callbacks, and static array declarations outside component render scopes.
3. DOM Persistence: Use CSS toggling (`hidden` vs `block` with WAI-ARIA `role="tabpanel"` and `aria-hidden`) for light tab containers instead of destroying/re-mounting DOM nodes.
4. Data Normalization: Sanitize third-party API payloads (like TMDB/OMDb) inside custom query hooks before passing data down to UI components.