# VOLUNSPORT Morocco Frontend Design System

## Purpose

This document defines the shared visual and interaction foundation for the VOLUNSPORT Morocco frontend. The system extends the existing landing-page language rather than introducing a new visual direction. It is intentionally separate from page-specific composition: dashboards, event workflows, and admin workspaces should consume these components rather than recreate their own visual rules.

The design system uses the existing Tailwind v4 tokens in `src/styles.css`, the existing Radix/Vaul primitives in `src/components/ui`, Lucide icons, the current VolunSport logo, and the existing Moroccan zellij assets. It does not change Supabase, backend services, database behavior, or authentication rules.

## Shared component entry point

Reusable application-level components are available from:

```text
src/components/design-system/index.tsx
```

The module composes existing primitives and provides VolunSport-specific presentation for:

| Component                  | Purpose                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `VSButton`                 | Existing button primitive exposed through the design-system namespace                                |
| `VSInput`                  | Existing input primitive                                                                             |
| `VSSelect`                 | Existing Radix select root                                                                           |
| `VSTextarea`               | Existing textarea primitive                                                                          |
| `VSCard` and subcomponents | Shared card structure                                                                                |
| `VSBadge`                  | Existing badge primitive                                                                             |
| `VSStatusBadge`            | Semantic status treatment for accepted, pending, rejected, waitlisted, published, and related states |
| `VSAvatar`                 | Branded avatar sizes and fallback treatment                                                          |
| `VSModal*`                 | Existing Radix dialog API exposed as modal aliases                                                   |
| `VSDrawer*`                | Existing Vaul drawer API exposed as drawer aliases                                                   |
| `VSDropdown*`              | Existing Radix dropdown API exposed as dropdown aliases                                              |
| `VSTabs*`                  | Existing Radix tabs API exposed as tabs aliases                                                      |
| `VSBreadcrumbs`            | Compact accessible page navigation                                                                   |
| `VSSearchInput`            | Search field with Lucide search affordance                                                           |
| `VSFilterControls`         | Consistent filter-control container                                                                  |
| `VSEmptyState`             | Branded empty state with icon and action slot                                                        |
| `VSLoadingState`           | Branded loading state with accessible status message                                                 |
| `VSErrorState`             | Branded recoverable error state                                                                      |
| `VSSuccessState`           | Branded success confirmation state                                                                   |
| `VSPageHeader`             | Page-level editorial heading and optional action                                                     |
| `VSSectionHeader`          | Section title, eyebrow, description, and action                                                      |
| `VSStatCard`               | Dashboard/impact metric card                                                                         |
| `VSEventCard`              | Event opportunity card with cover, sport, date, location, capacity, and CTA                          |
| `VSRoleCard`               | Volunteer role card with availability, requirements, and action slot                                 |
| `VSNotificationItem`       | Notification row with unread treatment and timestamp                                                 |

The lower-level primitives remain available in `src/components/ui` for cases that need their full Radix API. The design-system file is a semantic composition layer, not a replacement component library.

## Colors and tokens

Do not introduce page-specific hex colors or a second color system. Use the CSS custom properties and Tailwind aliases already defined in `src/styles.css`.

| Token                 | Role                   | Usage guidance                                                                          |
| --------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| `background`          | Warm near-white canvas | Page backgrounds and quiet surfaces                                                     |
| `foreground`          | Deep green-tinted text | Primary body and heading text                                                           |
| `card`                | White surface          | Cards, forms, popovers, and elevated content                                            |
| `primary`             | Moroccan green         | Primary actions, active states, progress, links, and positive emphasis                  |
| `primary-foreground`  | Light text on green    | Text and icons on primary surfaces                                                      |
| `accent`              | Terracotta/zellij red  | High-attention accents, destructive semantic styling, and selected editorial highlights |
| `sand`                | Warm sand              | Background accents and Moroccan editorial surfaces                                      |
| `ink`                 | Deep navy/green ink    | Dark hero panels, sidebar surfaces, strong contrast sections, and avatar fallbacks      |
| `gold`                | Saffron/gold           | Supporting highlight only; do not use as a second primary action color                  |
| `muted`               | Quiet surface          | Secondary blocks, disabled or low-emphasis regions                                      |
| `muted-foreground`    | Secondary text         | Descriptions, metadata, timestamps, and helper copy                                     |
| `border` / `hairline` | Fine structure         | Card outlines, separators, and controls                                                 |

The existing gradients are `--gradient-ink`, `--gradient-accent`, and `--gradient-veil`. Use them only for intentional editorial hero or dark-panel surfaces. Random gradients, excessive glass effects, and arbitrary new color scales are not part of the system.

## Typography

The current system uses Geist for display, Inter for body copy, Geist Mono for eyebrows and metadata, and Noto Kufi Arabic for Arabic/RTL contexts. Headings use tight negative tracking and balanced wrapping. Eyebrows are uppercase, compact, mono-spaced labels with increased tracking.

| Content       | Recommended treatment                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Page title    | `text-3xl` to `text-4xl`, `font-display`, semibold, tight tracking       |
| Section title | `text-xl` to `text-2xl`, semibold, tight tracking                        |
| Body copy     | `text-sm` or `text-base`, relaxed line height, muted for supporting copy |
| Eyebrow       | Existing `.eyebrow` utility, mono, uppercase, tracked                    |
| Metadata      | `text-xs`, muted foreground, short labels rather than full sentences     |
| Metric value  | `text-3xl` or larger, semibold, tight tracking                           |
| Arabic        | Preserve `I18nProvider` RTL behavior and Noto Kufi Arabic fallback       |

Copy should be concise, human, and operational. Prefer phrases such as “Your impact starts here” and “Find your next opportunity” over dense administrative language.

## Border radius and surfaces

The base radius is controlled by `--radius: 0.75rem`. Use the existing scale instead of arbitrary shapes.

| Surface                   | Recommended radius                                            |
| ------------------------- | ------------------------------------------------------------- |
| Small controls and badges | `rounded-full` or the base radius                             |
| Inputs/selects            | `rounded-2xl` to `rounded-3xl` for app forms                  |
| Cards                     | `rounded-[1.5rem]` to `rounded-[2rem]` for editorial surfaces |
| Hero panels               | `rounded-[2rem]` or larger when the composition supports it   |
| Mobile sheets/drawers     | Use the existing drawer primitive and its top radius          |

Cards should normally use a fine `border-border` outline and a restrained `--shadow-float` or `--shadow-lift`. Avoid stacking heavy shadows, thick borders, and strong textures on the same surface.

## Spacing

Use the existing Tailwind spacing scale and the `shell` utility. The visual rhythm should feel spacious and editorial, with more air around major page sections than inside compact controls.

| Context                | Guidance                                                             |
| ---------------------- | -------------------------------------------------------------------- |
| Page shell             | Use `.shell`; preserve its responsive horizontal padding             |
| Page sections          | Prefer `mt-8`, `mt-10`, or `mt-12` between major blocks              |
| Card content           | Use `p-5` or `p-6`; use `p-7`/`p-8` for feature panels               |
| Compact control groups | Use `gap-2` to `gap-3`                                               |
| Card grids             | Use `gap-4` for stat cards and `gap-6` for feature cards             |
| Mobile layout          | Stack first, then introduce grids at `sm`, `md`, or `lg` breakpoints |

## Button variants

Use the existing `VSButton`/`Button` primitive rather than recreating button classes in routes.

| Variant     | Use                                                               |
| ----------- | ----------------------------------------------------------------- |
| Default     | Primary volunteer actions such as apply, save, continue, or join  |
| Outline     | Secondary actions that need a visible boundary on a light surface |
| Secondary   | Low-emphasis actions grouped with a primary action                |
| Ghost       | Toolbar, navigation, and compact icon-adjacent actions            |
| Link        | Inline navigation where a full button would be too heavy          |
| Destructive | Irreversible or dangerous actions only                            |

Primary actions should normally use Moroccan green with clear foreground contrast. CTA text should begin with a verb and include a Lucide directional icon only when it improves scanning.

## Card variants

Cards are editorial containers, not the default wrapper for every element.

| Variant  | Use                                                                           |
| -------- | ----------------------------------------------------------------------------- |
| Standard | General content, lists, and forms                                             |
| Feature  | Hero-adjacent event, impact, or profile completion panel with stronger shadow |
| Quiet    | Secondary metadata or supporting information with minimal shadow              |
| Dark     | Intentional ink/navy editorial sections with light text                       |
| Media    | Event and story cards with an image region, overlay badge, and hover zoom     |
| State    | Empty, loading, error, or success feedback surfaces                           |

Use `VSEventCard`, `VSRoleCard`, `VSStatCard`, and the state components for domain-specific card patterns. Avoid creating a one-off card structure in each route.

## Status variants

`VSStatusBadge` normalizes status labels and maps them to semantic tones. Status color must not be the only source of meaning; include the text label and, where needed, a small icon or supporting copy.

| Status family               | Token treatment                                      |
| --------------------------- | ---------------------------------------------------- |
| Accepted/approved/completed | Soft green surface and green text                    |
| Pending                     | Soft saffron/amber surface and dark amber text       |
| Waitlisted                  | Soft violet surface and violet text                  |
| Rejected                    | Soft accent/destructive surface and destructive text |
| Withdrawn/draft             | Muted surface and muted text                         |
| Published                   | Soft primary surface and primary text                |

## Icon rules

Use Lucide icons consistently. Icons should clarify action, navigation, status, or content type rather than decorate every line.

Icons should normally use `h-4 w-4` for controls and metadata, `h-5 w-5` for cards, and `h-6 w-6` or larger only for empty/loading state emphasis. Keep stroke weight consistent with Lucide defaults. Decorative icons should be marked `aria-hidden="true"`; interactive icon-only controls must have an accessible label.

Recommended semantic icon vocabulary includes `CalendarDays` for dates/events, `MapPin` for location, `Users` for volunteer capacity, `Clock3` for hours, `Bell` for notifications, `CheckCircle2` for success, `CircleAlert` for errors, `Search` for discovery, `ArrowRight` for forward CTA, `Award` for certificates, and `Trophy` for achievements.

## Responsive rules

The system is mobile-first. Components must remain usable at narrow widths before adding multi-column layouts.

1. Use stacked page headers and card grids on small screens.
2. Use `sm`, `md`, and `lg` breakpoints only when the content genuinely benefits from additional columns.
3. Use the existing drawer primitive for mobile filters and side navigation rather than allowing dense desktop controls to overflow.
4. Keep touch targets comfortably sized; icon-only controls require a visible or assistive label.
5. Do not rely on hover to reveal important content or actions.
6. Keep event titles and status labels readable when cards become narrow.
7. Preserve the existing public mobile navigation and volunteer mobile drawer behavior while future shells converge.
8. Test long event names, Arabic text, empty states, and form validation messages at mobile widths.

## Modal, drawer, dropdown, and tabs rules

Use the existing Radix and Vaul primitives through the `VSModal*`, `VSDrawer*`, `VSDropdown*`, and `VSTabs*` aliases. These components inherit keyboard interaction, focus management, and accessible semantics from the installed primitives.

Modals are for focused confirmation or short forms. Drawers are preferred for mobile filters, mobile navigation, and contextual details. Dropdowns are for compact menus and account actions. Tabs are for switching between closely related views without changing the page’s primary task.

## Empty, loading, error, and success states

Every data-backed page should visibly handle all four states.

- `VSEmptyState` provides an icon, title, explanation, and optional action.
- `VSLoadingState` uses a branded spinner and an accessible `role="status"` message.
- `VSErrorState` communicates recovery copy and accepts a retry/action slot.
- `VSSuccessState` confirms a completed action with green semantic treatment and an optional next step.

State components should be informative rather than merely decorative. Empty states should explain what the user can do next; error states should avoid exposing raw database errors in primary UI copy.

## Animation rules

Motion should reinforce hierarchy and feedback, not compete with content.

1. Preserve the landing page’s Lenis/reduced-motion behavior and Framer Motion conventions.
2. Use the existing `lift` and `media-zoom` utilities for restrained hover feedback.
3. Prefer short opacity/transform transitions for controls and cards.
4. Never make core information depend on animation completing.
5. Honor `prefers-reduced-motion` for page-level motion and avoid adding unnecessary looping effects.
6. Use pattern textures at low opacity; animation should never make the zellij texture visually noisy.

## Existing assets and brand treatment

Use `public/logo.png` or the established imported logo asset according to the existing route convention until asset normalization is handled in a separate task. Use `public/moroccan-pattern.png` or `src/assets/zellij-pattern.jpg` subtly as a texture layer, hero overlay, sidebar surface, or empty-state accent. Do not tile the pattern at high opacity behind dense text or form controls.

The design foundation should feel Moroccan through proportion, pattern, warmth, and editorial contrast—not through adding unrelated decorative motifs or a second color palette.

## Implementation boundary for this task

This design-system pass creates shared primitives and documents their usage. It intentionally does not complete the dashboard, admin workspaces, event CRUD, application review, notification actions, analytics, or other product pages. It also does not modify Supabase, backend services, database tables, migrations, RLS, or authentication rules.
