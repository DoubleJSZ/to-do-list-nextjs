# AI Coding Agent Instructions for Next.js CRUD Todo App

## Project Overview
A **Next.js 16** todo list application using **React 19** and **Supabase** as the backend database. This is a full-stack CRUD application with a client-side UI and serverless database integration.

**Key Stack:**
- Next.js 16.0.4 (App Router)
- React 19.2.0 (client components)
- Supabase (@supabase/supabase-js v2.87.1)
- JavaScript/JSX with jsconfig path aliases

## Architecture & Data Flow

### Component Structure
```
app/
├── layout.js          # Root layout with Geist fonts
├── page.js            # Homepage (landing page template)
└── todolist/
    └── page.jsx       # Main CRUD interface (client component)
```

### Database Schema
- **Table:** `todoTable` (Supabase)
- **Columns:** `id` (PK), `title` (text), `completed` (boolean), `created_at` (timestamp)
- **Ordering:** Results ordered by `created_at` descending (newest first)

### Client-Server Flow
1. **Initialization:** `useEffect` on mount calls `fetchTodos()` to populate initial state
2. **Operations:** All CRUD operations directly call Supabase via `supabase` client instance
3. **State Sync:** Local React state (`todos`) immediately reflects DB changes
4. **Error Handling:** Operations log errors to console but continue gracefully

## Critical Implementation Details

### Supabase Integration (app/lib/supabaseClient.js)
- **Client Setup:** `createClient(url, anonKey)` initialized with environment variables
- **Env Vars Required:**
  - `NEXT_PUBLIC_SUPABASE_URL` (exposed to browser)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (exposed to browser)
- **Pattern:** Singleton export `export const supabase = createClient(...)`
- **Error Handling:** Missing env vars throw immediately on import

### Client Component Pattern (app/todolist/page.jsx)
- **"use client"** directive at top (required for useState/useEffect)
- **State Management:** No external state library; uses React hooks only
- **Optimistic Updates:** State updates before DB confirmation (potential race conditions)
- **Inline Styles:** All CSS is inline object syntax (no CSS modules)

### API Calls Pattern
All operations follow this structure:
```javascript
const { data, error } = await supabase
  .from('todoTable')
  .operation()
  .select() // or .eq(), .order(), etc.
  .single(); // returns one object, not array

if (error) {
  console.error('Error message:', error.message);
  return;
}
// Use data
```

## Developer Workflows

### Local Development
```bash
npm run dev
# Runs on http://localhost:3000 with hot reload
```

### Build & Production
```bash
npm run build      # Creates .next optimized bundle
npm start          # Starts production server
```

### Testing & Debugging
- **No test suite** currently configured
- **Console errors:** Check browser DevTools for Supabase errors
- **Hot reload:** Automatic on file saves in dev mode
- **Env vars:** Update `.env.local` and restart dev server if changed

## Path Alias Configuration
jsconfig.json defines:
```json
"@/*": ["./*"]
```
Use `@/app/...`, `@/lib/...` in imports (though not currently used in the codebase).

## Common Patterns & Conventions

### Naming
- **Supabase table:** `todoTable` (camelCase, singular scope)
- **React hooks:** Standard `useState`, `useEffect`
- **Functions:** camelCase (e.g., `fetchTodos`, `addTodo`, `toggleTodo`)
- **Components:** PascalCase as default exports
- **Spanish in UI:** Comments and console messages use Spanish ("tareas", "Cargando")

### State Update Patterns
- **Add:** Prepend new item to array: `[data, ...prev]`
- **Toggle:** Map and replace: `prev.map(t => t.id === id ? data : t)`
- **Delete:** Filter out: `prev.filter(t => t.id !== id)`

### Form Handling
- Form submit uses `e.preventDefault()` to avoid reload
- Input value bound to state with `onChange` handler
- Empty validation: `.trim()` before submission

## External Dependencies & Integration

### Supabase
- **Connection:** Configured via public credentials in `supabaseClient.js`
- **Operations:** Uses Postgres-like query builder API
- **Methods Used:** `.from()`, `.select()`, `.insert()`, `.update()`, `.delete()`, `.eq()`
- **Side Effects:** Database schema changes require manual Supabase console updates

### Next.js Specifics
- **App Router:** Uses `app/` directory structure
- **Font Optimization:** Geist fonts auto-imported via `next/font/google`
- **Images:** Use `next/image` component for optimization
- **Build Output:** `.next/` directory (add to `.gitignore`)

## Guidelines for Modifications

1. **Keep state local:** No Redux/Zustand; use React hooks only
2. **Maintain Spanish conventions:** Keep UI/console messages in Spanish
3. **Inline styling:** Continue using inline object syntax for styles
4. **Error handling:** Always add `.message` to error objects
5. **Testing:** Manual testing via dev server; no automated tests currently
6. **Database:** Update `todoTable` schema in Supabase console before code changes
