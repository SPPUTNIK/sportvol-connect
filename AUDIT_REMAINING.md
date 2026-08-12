# Audit: Partial and Mock Status

## Partial implementation
- Auth flow exists and is wired to Supabase, but user onboarding is minimal and lacks profile completion screens.
- `updateProfile` is implemented in `src/lib/auth.tsx`, but no edit profile route or form is available.
- Dashboard references profile fields and shows metrics, but there is no actual event query or volunteer application system.
- `signUp` creates a profile row with only `id`, `email`, and `role: "volunteer"`.
- Password reset sends an email request, yet no reset confirmation page is included.
- Route protection on `/dashboard` is only client-side.

## Mocked or placeholder behavior
- Homepage `Events` cards are built from static i18n entries and local image assets, not backend event data.
- The dashboard statistics are placeholders; `Events` is hardcoded to `0` and there is no event list.
- `admin` role support exists only as a boolean flag in auth state and does not correspond to any UI or backend workflow.
- There are domain types for event scheduling and volunteering in `src/lib/types.ts`, but no code uses those types for live Supabase access.

## Missing collaboration boundaries
- No Supabase migration files or schema definitions are tracked in the repo.
- `supabase/config.toml` is configured for local dev, but `db.migrations.schema_paths` is empty and no SQL schema files are present.
- No admin/organizer pages, event creation, volunteer match, shift management, or certificate workflows are implemented.
