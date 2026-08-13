# VOLUNSPORT Morocco Frontend Audit

## Audit scope

This document records the state of the existing VOLUNSPORT Morocco frontend after a read-only inspection. No new features were implemented for this audit. No Supabase configuration, database object, migration, RLS policy, backend service, authentication rule, or existing asset was modified. The only intended project-file output from this step is this audit document.

## Executive summary

The project is a **TanStack Start + React 19 + TypeScript** application with Vite, Tailwind CSS v4, Radix UI primitives, Lucide icons, Framer Motion, React Hook Form, Recharts, and Supabase JS. It has two visually distinct frontend experiences: a public marketing site at `/` and an authenticated volunteer/admin area composed from route-level layouts.

The public site is the strongest and most coherent part of the frontend. It is highly componentized, multilingual, responsive, and built around a distinctive VolunSport Morocco visual identity using deep navy/green ink, warm cream, Moroccan zellij texture, green accents, rounded editorial cards, motion, and sports photography. The volunteer area now has broad route coverage, a branded dashboard, authentication pages, event browsing/detail/application flows, and an admin overview. However, the app area has duplicated shell patterns, inconsistent use of live versus demo data, weak route-level authorization boundaries, and an admin route that is still an overview rather than a complete operational workspace.

The main architectural direction should be to preserve the public marketing composition and existing UI primitives, then consolidate the authenticated experience around a single typed app shell, a typed feature/service boundary, and explicit route metadata for public, volunteer, and admin access. The dashboard should continue borrowing the landing page’s visual language, but its data cards and operational states should be backed by consistent service abstractions rather than local demo content.

## Current framework and tooling

| Area | Current implementation |
|---|---|
| Application framework | TanStack Start with React 19 and TypeScript |
| Build tool | Vite 7 with TanStack/Vite integration and Nitro output |
| Router | TanStack Router file-based routing with generated `src/routeTree.gen.ts` |
| Styling | Tailwind CSS v4 through `@tailwindcss/vite`, `tw-animate-css`, and `src/styles.css` |
| UI primitives | Radix UI packages, local `src/components/ui` wrappers, class-variance-authority, tailwind-merge |
| Motion | Framer Motion, Lenis smooth scrolling on the landing page, local motion helpers |
| Forms | React Hook Form and `@hookform/resolvers` are installed; most current forms use local React state and native controls |
| Data visualization | Recharts is installed; current frontend uses mostly compact CSS-based visualizations and service data |
| Data/auth provider | Supabase JS client with session persistence and auth listeners |
| Data fetching | Direct service calls in route effects; React Query is installed and provided at the root but is not the primary route data pattern |
| Package metadata | `package.json`, `package-lock.json`, `bun.lock`, `bunfig.toml`; npm scripts include `dev`, `build`, `build:dev`, `preview`, `lint`, and `format` |

## Current folder structure

```text
.
├── public/
│   ├── favicon.png
│   ├── logo.png
│   ├── moroccan-pattern.png
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── cta.jpg
│   │   ├── event-basketball.jpg
│   │   ├── event-cycling.jpg
│   │   ├── event-football.jpg
│   │   ├── event-marathon.jpg
│   │   ├── gal-1.jpg … gal-4.jpg
│   │   ├── hero.jpg
│   │   ├── mission.jpg
│   │   ├── volunsport-logo.jpg
│   │   ├── volunsport-logo.png
│   │   └── zellij-pattern.jpg
│   ├── components/
│   │   ├── app/
│   │   ├── site/
│   │   └── ui/
│   ├── integrations/supabase/
│   │   ├── auth-attacher.ts
│   │   ├── client.ts
│   │   └── types.generated.ts
│   ├── lib/
│   │   ├── auth.tsx
│   │   ├── i18n.tsx
│   │   ├── mock-data.ts
│   │   ├── supabase.ts
│   │   ├── types.ts
│   │   └── utilities and error helpers
│   ├── routes/
│   ├── services/
│   │   ├── backendService.ts
│   │   └── mockService.ts
│   ├── routeTree.gen.ts
│   ├── router.tsx
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
├── supabase/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── components.json
```

The repository also contains product specification and status documents such as `frontend.md`, `backend.md`, `FRONTEND_IMPLEMENTED.md`, and `FRONTEND_REMAINING.md`. These documents describe intended scope and historical implementation status; this audit is based on the current source tree.

## Existing routes

| Route | Current purpose | Current state |
|---|---|---|
| `/` | Public marketing landing page | Complete, highly componentized, multilingual marketing composition |
| `/about` | Public about page | Present |
| `/events` | Event discovery, search, sport/city filters, and sorting | Live service call through the module named `mockService`; loading, error, and empty states present |
| `/events/$slug` | Event detail, role selection, application form, and success state | Present; service-backed and client-validated |
| `/login` | Email/password login with safe `next` handling | Present and Supabase-backed |
| `/register` | Registration form | Present and Supabase-backed |
| `/forgot-password` | Password reset request | Present and Supabase-backed |
| `/reset-password` | Password update UI | Present |
| `/dashboard` | Authenticated volunteer dashboard | Present; inline volunteer shell, profile-derived stats, branded hero, empty states, and dashboard navigation |
| `/applications` | Current volunteer applications | Present; service-backed |
| `/my-events` | Accepted event commitments | Present; shared feature-page/demo-oriented implementation |
| `/schedule` | Volunteer shifts | Present; service-backed through `getShifts()` |
| `/training` | Training module list and progress | Present; service-backed list with resources, no dedicated detail route |
| `/accreditation` | Accreditation view | Present; service-backed application data and frontend presentation |
| `/attendance` | Attendance records | Present; service-backed read-only presentation; backend check-in workflow is not implemented in the UI |
| `/hours` | Volunteer-hours dashboard | Present; shared feature-page/demo-oriented implementation |
| `/certificates` | Certificate list | Present; service-backed route exists, plus shared demo certificate presentation elsewhere |
| `/achievements` | Achievement progress | Present; frontend/demo-oriented implementation |
| `/notifications` | Notification list | Present; service-backed read-only list |
| `/profile` | Profile editor and impact summary | Present; reads and updates profile through `useAuth().updateProfile()` |
| `/settings` | Account, notifications, language, and privacy preference entry points | Present; frontend-only controls without substantive setting mutations |
| `/admin` | Admin overview metrics and management entry cards | Present; role-gated client-side and live metric queries, but no dedicated CRUD subroutes |
| `/404` | Explicit not-found route | Present |
| `/.lovable/oauth/consent` | Lovable OAuth consent integration route | Present |
| `/.mcp/list-tools` and `/.well-known/oauth-protected-resource` | Integration/metadata routes | Present in the repository route tree or adjacent route handlers |

The generated route tree is maintained in `src/routeTree.gen.ts`. Most app navigation uses hard-coded href strings or route links rather than a shared route metadata registry.

## Existing layouts

### Root layout

`src/routes/__root.tsx` defines the root HTML shell, global metadata, stylesheet link, font links, error and not-found boundaries, `AuthProvider`, `QueryClientProvider`, and the nested `Outlet`. It is the only universal provider boundary. Error handling reports through the Lovable error reporter and offers retry/home actions.

### Public marketing layout

The `/` route composes `Nav`, `Hero`, `TrustedBy`, `Mission`, `WhyVolunteer`, `Events`, `Journey`, `Impact`, `Stories`, `Gallery`, `Faq`, `CallToAction`, `Footer`, and `JoinDialog`. It has its own navigation, smooth scrolling, section anchors, multilingual content, and landing-page composition. This is a **marketing shell**, not a generic app shell.

### Volunteer application shell

`src/components/app/AppShell.tsx` provides a reusable authenticated shell for several newer volunteer routes. It includes a fixed desktop sidebar, mobile drawer and overlay, grouped navigation, sticky top bar, notification shortcut, profile chip, active-path styling, and account card. It uses a mixture of TanStack `Link` and plain anchors.

The current `/dashboard` route does **not** use `AppShell`; it contains an additional inline sidebar, mobile overlay, header, user card, and content wrapper. This creates a second volunteer-shell implementation with overlapping responsibilities and different styling/navigation behavior.

### Admin layout

There is no separate admin shell. `/admin` is a standalone route with its own content layout, role gate, metric cards, management cards, and dark principle panel. Management cards currently link back to `/dashboard` rather than dedicated admin workspace routes.

## Existing reusable components

### Public site components

The public marketing composition includes `Nav`, `Hero`, `TrustedBy`, `Mission`, `WhyVolunteer`, `Events`, `Journey`, `Impact`, `Stories`, `Gallery`, `Faq`, `CallToAction`, `Footer`, `JoinDialog`, `LanguageSwitcher`, `Counter`, and motion helpers. These components are the strongest reusable expression of the product’s public visual identity.

### Application shell components

`AppShell` is the main authenticated volunteer layout. `FeaturePage` exports shared presentation pages for accepted events, schedule, hours, achievements, and certificates, with local `PageIntro`, `Info`, and `Metric` helpers. The current dashboard has its own local `SidebarLabel`, `SidebarItem`, `StatCard`, `SectionHeading`, `QuickAction`, `EmptyState`, `MetaPill`, and `DashboardLoading` helpers.

### UI primitives

`src/components/ui` contains approximately 51 TSX UI primitives and wrappers, including buttons, cards, badges, dialogs, drawers, forms, inputs, labels, progress, tabs, tables, charts, empty/loading states, event cards, role cards, status pills, sidebar, and other Radix-based building blocks. `EventCard`, `RoleCard`, `EmptyState`, `LoadingState`, `StatusPill`, and table/form primitives are especially relevant to future route work.

### Current reuse issue

The repository has enough primitives to support the requested product, but several routes bypass them with native `<input>`, `<select>`, `<textarea>`, and bespoke class strings. There are also duplicate local empty/loading/card patterns and duplicate app-shell implementations.

## Existing design system

The design tokens are centralized in `src/styles.css` using Tailwind v4 `@theme inline` values and CSS custom properties. The system uses:

| Token family | Current direction |
|---|---|
| Base palette | Warm near-white background, dark green-tinted foreground, white cards, muted cream surfaces |
| Primary | Moroccan green, approximately `#0F8A55` in the source comments |
| Accent | Terracotta/zellij red |
| Supporting colors | Deep navy ink, warm sand, saffron/gold, cobalt variable retained under the brand namespace |
| Typography | Geist/Inter for display and body, Geist Mono for eyebrows, Noto Kufi Arabic for RTL |
| Shape | Rounded cards and controls, base radius `0.75rem`, larger 2xl/3xl page surfaces |
| Shadows | `--shadow-float` and `--shadow-lift` with soft elevated editorial depth |
| Gradients | Ink, accent, and veil gradients for dark editorial sections |
| Utilities | `shell`, `eyebrow`, display scale classes, `ink-panel`, glass utilities, gradient text, zellij utilities, lift, media zoom, no-scrollbar, marquee |
| Responsive | Tailwind breakpoint classes, mobile sidebar/drawer behavior, responsive grids, and public-nav mobile menu |
| Motion | Framer Motion on public sections, Lenis smooth scrolling when reduced motion is not preferred, hover lift/media zoom utilities |
| RTL | `I18nProvider` updates `lang` and `dir`; Arabic typography adjustments exist in global CSS |

The stylesheet also applies a global zellij pattern using `body::before` and references `./assets/zellij-pattern.jpg`. The repository contains both `src/assets/zellij-pattern.jpg` and public pattern assets. This creates two possible asset-loading conventions that should be normalized later.

The supplied VolunSport logo and Moroccan pattern are present as `public/logo.png` and `public/moroccan-pattern.png`, while the public landing components also import assets from `src/assets`. Both conventions are currently active.

## Existing authentication implementation

`AuthProvider` in `src/lib/auth.tsx` is mounted at the root and exposes `session`, `user`, `profile`, `loading`, `isAdmin`, `signIn`, `signUp`, `signOut`, `sendResetPasswordEmail`, and `updateProfile` through `useAuth()`.

Session restoration uses `supabase.auth.getSession()`. Auth changes are tracked through `supabase.auth.onAuthStateChange()`. A signed-in user triggers a profile fetch from `profiles` by user ID. Sign-up creates the Supabase auth user and upserts a minimal volunteer profile with `role: "volunteer"`. Profile updates explicitly strip client-supplied `role` and `id` values before writing.

The login route supports a sanitized `next` parameter and redirect after sign-in. Register, forgot-password, and reset-password pages exist. Authentication boundaries are mostly implemented in route components through client-side loading checks and redirects rather than route loaders or a shared route guard.

The Supabase client is lazily initialized through a proxy in `src/integrations/supabase/client.ts`, uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` on the client with server fallbacks, persists sessions in `localStorage`, and adapts new `sb_publishable_`/`sb_secret_` key behavior through a custom fetch wrapper.

## Existing event implementation

The public event listing calls `getAllEvents()` from `src/services/mockService.ts`. Despite the module name, this function queries Supabase `events` with nested `event_roles`, filters to published status, and orders by start date. The listing adds client-side search by name/sport/city/venue, sport and city filters, and upcoming/newest/most-available sorting.

`EventCard` is reusable and presentational. It resolves cover images from the event or `eventCoverDefaults`, displays sport, title, location, date, and available/filled positions, and links to `/events/$slug`.

The event detail route calls `getEventBySlug()`, renders cover image, dates, venue, capacity, remaining positions, deadline, requirements, and roles, and collects availability, experience, and motivation. It requires a profile before submitting and calls `applyForRole()`.

`applyForRole()` performs client-side checks for authentication, published event state, application deadline, role capacity, and duplicate application before inserting a pending application. These checks improve UX but are not a substitute for trusted transactional enforcement. The event detail form does not yet expose every specification field such as skills, languages, or additional information.

## Existing dashboard implementation

The current `/dashboard` route is a dedicated inline volunteer workspace rather than a consumer of `AppShell`. It has a mobile sidebar overlay, a deep primary-colored sidebar with logo and Moroccan pattern, grouped navigation, a user card, sticky top bar, notification icon, profile chip, page intro, landing-page-inspired hero, metric cards, upcoming-event empty state, quick-access actions, recent-application empty state, achievement empty state, profile completion CTA, and footer.

The dashboard derives `firstName`, volunteer hours, and attendance rate from `useAuth().profile`. Events and certificates currently render zero/empty states rather than loading full dashboard aggregates. It intentionally uses a polished frontend presentation, but dashboard data is not yet composed from a dedicated dashboard query/service and the inline shell duplicates `AppShell`.

## Existing admin implementation

`/admin` is role-gated by checking `profile.role === "admin"` in the client. It loads overview metrics from Supabase using direct queries to `profiles`, `events`, `applications`, and `volunteer_hours`.

The page shows volunteer, active-event, application, and official-hour counts, plus management cards for events, applications, volunteers, training, attendance, and notifications. Those cards currently link to `/dashboard`, so the admin surface is an overview and navigation placeholder rather than a complete admin product.

There are no dedicated admin routes for event CRUD, event roles, shifts, application decisions, volunteer management, training administration, accreditation, attendance correction, certificates, notifications, reports, or analytics. There is also no separate admin shell with denser operational navigation.

## Existing assets

The frontend includes:

- `public/logo.png` and `public/favicon.png`.
- `public/moroccan-pattern.png` for dashboard/brand surfaces.
- `src/assets/volunsport-logo.png` and `.jpg`.
- `src/assets/zellij-pattern.jpg` for the global/site pattern utilities.
- `src/assets/hero.jpg`, `mission.jpg`, `cta.jpg`, event images, and gallery images.
- Event cover fallbacks in `src/lib/mock-data.ts`.

The public site imports several assets directly from `src/assets`, while the dashboard and global CSS use public or relative pattern paths. Asset duplication and inconsistent import conventions are current maintenance concerns.

## Existing Moroccan background and pattern

The Moroccan/zellij identity is implemented in three ways: the global `body::before` pattern in `src/styles.css`, `zellij`/`zellij-tile` utilities, and dashboard/public asset references. The public landing page uses pattern texture as a low-opacity layer and combines it with navy, cream, green, and photography. The current dashboard also uses the pattern in its sidebar and hero.

The visual system is distinctive and should be preserved. The main issue is not lack of identity; it is that the identity is implemented through multiple asset paths and duplicated layout compositions.

## Existing mock data and services

`src/lib/mock-data.ts` contains domain-shaped sample events, roles, applications, shifts, training, attendance, certificates, notifications, volunteer-hour aggregates, and event-cover defaults. It is useful for fallback/demo data and static domain examples.

`src/services/mockService.ts` is misnamed: it performs live Supabase reads and writes for events, applications, accepted events, shifts, training, attendance, certificates, notifications, volunteer hours, and application submission. `src/services/backendService.ts` is effectively a second live Supabase service layer with overlapping exports and similar logic.

Both service modules use `const db = supabase as any`, so the service boundary is not strongly typed even though generated Supabase types exist. Route components call these services directly from `useEffect()` and local state rather than using a consistent query/mutation abstraction.

## Existing responsive behavior

The public navigation has desktop and mobile modes with a mobile menu toggle. The landing page uses responsive grid/stack layouts, responsive type classes, motion-aware smooth scrolling, and a reduced-motion check before Lenis initialization.

The volunteer dashboard has a dedicated mobile overlay/drawer and desktop fixed sidebar. `AppShell` also has a mobile overlay/drawer and fixed desktop sidebar, which means there are currently two separate responsive shell implementations. Event listing uses responsive grids and stacks filters but does not appear to provide a dedicated mobile filter drawer. Most forms use responsive grid classes and native controls.

The app has a reasonable responsive foundation, but a full browser-based mobile QA pass is still needed for event detail/application form, schedule scanability, accreditation, attendance, admin surfaces, and long data states.

## Existing problems

### Architecture and maintainability

1. The dashboard duplicates `AppShell`, sidebar navigation, profile header, mobile drawer, and account presentation.
2. `mockService.ts` and `backendService.ts` duplicate the Supabase service boundary and use misleading naming.
3. Service calls are mostly initiated in route `useEffect()` functions with local loading/error state instead of a consistent query/mutation layer.
4. Direct use of `any` weakens the Supabase data boundary in `auth.tsx`, `mockService.ts`, `backendService.ts`, and admin code.
5. Navigation is inconsistent: some routes use TanStack `Link`, while many shell links use plain anchors, which can cause full page reloads and makes active-route metadata harder to centralize.
6. Demo content in `FeaturePage` and `frontendDemo.ts` coexists with live service-backed routes without a visible environment or data-source boundary.
7. Asset references use both `src/assets` imports and public-root URL paths, with duplicate logo/pattern files.

### Product and UX

1. The dashboard’s events, certificates, and recent activity sections are largely empty-state/demo presentation rather than a composed live volunteer overview.
2. Admin management cards do not open dedicated admin workspaces and instead link back to `/dashboard`.
3. There is no dedicated training detail route such as `/training/$trainingId`.
4. There are no certificate detail routes, notification read-state actions, or substantive settings mutations.
5. Event application fields do not cover the full product specification, including skills, languages, and additional information.
6. Event filters do not expose all requested dimensions such as date, availability, or a dedicated mobile filter sheet.
7. Application status treatment is not clearly centralized in one reusable accessible `ApplicationStatus` component.
8. Attendance is read-only in the frontend; check-in/check-out is not implemented, as expected from the current scope.
9. The admin role gate is client-side; it improves UI access control but should not be treated as the security boundary.
10. Some route pages are visually polished but have uneven consistency because they use different shells and different levels of live data.

### Verification and quality

1. TypeScript verification currently passes.
2. The production build currently passes.
3. The full `npm run lint` command currently fails on existing Prettier formatting errors across multiple site and UI files. The run also reports non-blocking Fast Refresh warnings in component modules.
4. No source fix was applied during this audit to alter those verification results.

## Missing pages and capabilities

The current route tree covers the core public, volunteer, authentication, and admin overview surfaces, but the following capabilities are absent or incomplete:

| Missing or incomplete capability | Current gap |
|---|---|
| Admin shell | No dedicated dense operational navigation/layout |
| Admin event management | No CRUD route or form |
| Admin event roles | No dedicated route |
| Admin shifts | No create/assign/edit route |
| Admin application decisions | No accept/reject/waitlist workspace |
| Admin volunteer management | No searchable volunteer management route |
| Admin training management | No admin training workspace |
| Admin accreditation operations | No admin accreditation route |
| Admin attendance operations | No correction/verification route |
| Admin certificates | No issuance/detail management route |
| Admin notifications | No compose/send/read-state management route |
| Admin reports/analytics | No dedicated reporting or analytics route |
| Training detail | No `/training/$trainingId` route |
| Certificate detail | No `/certificates/$certificateId` route |
| Notification actions | Read/unread and related action interactions are incomplete |
| Rich dashboard aggregation | No dedicated live dashboard query/composition |
| Mobile event filters | No filter drawer/sheet matching the specification |
| Full application form | Skills, languages, and additional information are not all represented |
| Attendance actions | No frontend check-in/check-out workflow |
| Settings behavior | Entry cards exist, but settings are mostly presentation-only |
| Authenticated browser tests | No representative volunteer/admin end-to-end flow is present |

## Recommended frontend architecture

The recommended future architecture is a layered route-and-feature system:

```text
src/
├── routes/
│   ├── public/
│   ├── auth/
│   ├── volunteer/
│   └── admin/
├── layouts/
│   ├── PublicShell.tsx
│   ├── VolunteerShell.tsx
│   └── AdminShell.tsx
├── features/
│   ├── auth/
│   ├── events/
│   ├── applications/
│   ├── schedule/
│   ├── training/
│   ├── impact/
│   └── admin/
├── components/
│   ├── site/
│   ├── app/
│   └── ui/
├── data/
│   ├── queries/
│   ├── mutations/
│   └── demo/
├── lib/
│   ├── auth/
│   ├── i18n/
│   ├── supabase/
│   └── routing/
└── assets/
```

A future implementation should use route metadata to declare shell, access level, title, and breadcrumbs. `VolunteerShell` should become the single source of truth for dashboard, events, applications, schedule, impact, training, accreditation, attendance, notifications, profile, and settings. `AdminShell` should be separate and denser, with protected child routes for each operational workspace.

The data layer should consolidate `mockService.ts` and `backendService.ts` into a typed domain service or typed query/mutation modules. Query keys, loading/error/empty states, optimistic updates, and invalidation should be standardized. Demo data should live in a clearly named demo adapter and never be mixed silently with live service calls.

The existing public landing components, `src/components/ui` primitives, global design tokens, i18n provider, zellij utilities, and asset identity should remain the base layer. Forms should move toward shared field primitives and schema validation, while route-level authorization should be explicit and backed by the existing Supabase security model rather than treated as client-only UI gating.

## Reuse, refactor, create, and do-not-touch decisions

### A. What should be reused

- The TanStack Start/React/TypeScript foundation and generated file route tree.
- `src/components/site` marketing composition and public navigation.
- The global VolunSport design tokens, typography, gradients, shadows, zellij utilities, and responsive conventions in `src/styles.css`.
- The existing logo, sports photography, event covers, gallery assets, and Moroccan pattern identity.
- The `src/components/ui` Radix-based primitives, especially buttons, cards, forms, tables, progress, dialogs, sheets, event cards, role cards, empty states, loading states, and status pills.
- The root `AuthProvider`, Supabase session persistence, auth methods, i18n/RTL provider, error boundaries, and landing-page motion behavior.
- `EventCard`, `RoleCard`, `FeaturePage` helpers, and existing domain types as starting points rather than rewriting them immediately.
- The current route-level loading, error, and empty-state intent.

### B. What should be refactored later

- Consolidate the inline dashboard shell and `AppShell` into one typed volunteer shell.
- Rename and merge `mockService.ts` and `backendService.ts` into a single typed service/query boundary.
- Remove unnecessary `any` casts around Supabase operations.
- Establish a consistent TanStack Router `Link` strategy and route metadata registry.
- Normalize asset import paths and remove duplicate logo/pattern copies only after checking every reference.
- Introduce shared field/form/status components and schema validation for complex workflows.
- Move route data fetching from ad hoc `useEffect()` patterns into a consistent query/mutation abstraction.
- Separate demo adapters from live Supabase adapters with explicit names and environment behavior.
- Add centralized access guards and authenticated route context.

### C. What should be created later

- A dedicated `PublicShell`, `VolunteerShell`, and `AdminShell` layout model.
- Feature modules for events, applications, schedule, training, impact, certificates, notifications, and admin operations.
- Admin CRUD/detail routes for events, roles, shifts, applications, volunteers, training, attendance, certificates, notifications, reports, and analytics.
- Training detail, certificate detail, mobile event filter drawer, application status component, notification dropdown/read actions, and richer settings interactions.
- A dashboard aggregate query/service and live summary components.
- Authenticated volunteer/admin integration tests and responsive browser QA coverage.

### D. What should not be touched in the next frontend implementation step

- Supabase database schema, tables, indexes, triggers, RLS policies, seed data, and migrations.
- Backend/server code and server-side authorization behavior.
- Existing Supabase project configuration and credentials.
- Production history and pushed commits; the repository instructions specifically prohibit force pushing, rebasing, amending, or squashing already-published history.
- The public landing page’s established visual identity and reusable section composition unless a later task explicitly requests a marketing-page change.
- Existing stable asset files until a deliberate asset normalization plan is approved.

## Verification status

The audit used the existing repository at `/home/ubuntu/sportvol-connect` on branch `main`. The working tree was clean before the audit output was created.

| Command | Status | Notes |
|---|---|---|
| `npx tsc --noEmit --pretty false` | Passed | Exit code 0 |
| `npm run build` | Passed | Exit code 0; Vite/Nitro production output generated successfully |
| `npm run lint` | Failed | Existing Prettier formatting errors across multiple `src/components/site` and `src/components/ui` files; Fast Refresh warnings also appeared |

No lint fixes were applied because this task was explicitly audit-only.

## Final boundary statement

This document is an inspection result, not an implementation plan disguised as code. The recommendations above are intentionally not applied in this step. The next task can use this audit to prioritize frontend-only work while preserving the existing Supabase and backend boundaries.
