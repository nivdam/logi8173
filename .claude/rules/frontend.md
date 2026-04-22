# Frontend Rules

## Chakra UI v3
- Import from `@chakra-ui/react` (no wrapper layer needed — this is a fresh project)
- No native HTML tags (`<div>`, `<label>`, `<span>`) — use Chakra components
- No `style={{}}` — use Chakra props or `css={{}}`
- Use semantic tokens from theme, not raw hex values
- **Dialog/Drawer: NEVER use `key` prop, conditional render, or resetKey pattern** — always mounted, control via `open` prop only. Reset state in `onOpenChange`. Violating this leaves backdrop frozen in DOM.

## React Patterns
- `type` only, never `interface`
- `const` by default, `let` only when truly unavoidable
- No `any` or `as`
- Types at bottom of file
- One component per file
- Named exports (`export const X`)
- No `useEffect` unless genuine side effect — prefer derived state, event handlers

## Component Composition
- Don't leave components that do data loading + state + rendering of multiple sections — split them
- When a component contains multiple logical sections, extract each into a focused sub-component with a clear name
- The main (page-level) component stays an orchestrator: wires data, state, and actions — minimal JSX
- Prefer explicit names, simple props, and clear reading flow over clever patterns
- Before adding logic to an existing file, check if it should be a small extracted component or hook

## Mobile-First
- Operators use phones in the field — all layouts must work on mobile
- Touch targets minimum 44px
- Signature canvas must work on touch screens

## i18n
- All user-facing strings hardcoded in Hebrew (no i18n library needed — single language app)
- Variable names and code in English

## Persistence & Migrations
- localStorage keys prefixed with `logi8173_` (e.g. `logi8173_session`, `logi8173_active_activity_id`)
- **Migrations**: when renaming a key or changing a stored shape, read legacy value first, write it to the new key, then remove the legacy key. Never delete a legacy key without carrying over its value
- Prefer `undefined` over `null` for "absent" in reads — matches `auth-helpers.ts` conventions
- No SSR guards (`typeof window === "undefined"`) — Vite SPA, not needed
