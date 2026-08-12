# Audit: Issues and Gaps

## Functional and security issues
- `/dashboard` protection is only client-side. Unauthenticated users can still request the page and only get redirected after loading.
- Forgot password flow sends requests to Supabase with `redirectTo: /reset-password`, but there is no `/reset-password` route in the repo.
- `signUp` writes a minimal `profiles` row with only `id`, `email`, and `role: "volunteer"`; no user onboarding or profile completion UI exists.
- `isAdmin` is derived from `profile.role === "admin"`, but there is no admin route, admin interface, or role assignment UI.

## Backend/schema gaps
- Supabase integration is limited to auth and the `profiles` table. No other table queries or mutations exist in the frontend.
- Homepage event listings in `src/components/site/Events.tsx` are static content from i18n and image assets, not Supabase data.
- No SQL schema or migration files are present in the repository, and `supabase/config.toml` has an empty `db.migrations.schema_paths`, which means schema is not versioned in source control.
- There are no Supabase seed or table definitions for `events`, `event_roles`, `applications`, or volunteer scheduling despite domain types in `src/lib/types.ts`.

## Maintainability and missing coverage
- `updateProfile` exists, but there is no visible profile edit form or route.
- Auth state is restored and profile fetched, but there is no persistent query layer or React Query usage for event-related data.
- The `supabase` client checks env vars at runtime in `src/lib/supabase.ts`; environment setup is required but not captured in repo documentation.
