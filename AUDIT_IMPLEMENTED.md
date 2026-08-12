# Audit: What Is Done

## Auth and user session
- Supabase client created in `src/lib/supabase.ts`.
- Auth context implemented in `src/lib/auth.tsx`.
- User session restore via `supabase.auth.getSession()`.
- Auth state tracking via `supabase.auth.onAuthStateChange()`.
- `signIn`, `signUp`, `signOut`, `sendResetPasswordEmail`, and `updateProfile` methods are implemented.
- New sign-ups upsert a `profiles` record with `role: "volunteer"`.

## Routes and UI
- Public landing page at `/` in `src/routes/index.tsx`.
- Login page at `/login` in `src/routes/login.tsx`.
- Registration page at `/register` in `src/routes/register.tsx`.
- Forgot password page at `/forgot-password` in `src/routes/forgot-password.tsx`.
- Dashboard page at `/dashboard` in `src/routes/dashboard.tsx`.
- App shell wraps pages with `AuthProvider` in `src/routes/__root.tsx`.

## Profile scaffolding
- Profile type defined in `src/lib/types.ts`.
- Profile fetch by `id` from `profiles` table.
- Dashboard displays `profile` values such as `first_name`, `volunteer_hours`, and `attendance_rate`.
- `isAdmin` is derived from `profile.role === "admin"`.
