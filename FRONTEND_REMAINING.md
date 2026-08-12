# Frontend Remaining

The public and volunteer-facing foundation is now substantially complete, and the admin overview route is available. The following items remain for a full production-grade frontend matching every section of the expanded specification.

## Remaining

The admin shell needs to become a dedicated fixed-sidebar shell with individual frontend workspaces for events, event roles, shifts, applications, volunteers, training, accreditation, attendance, hours, certificates, notifications, reports, and analytics. The current `/admin` route provides the overview and management entry point, but those operational screens are not yet separate routes.

The volunteer experience still needs richer detail pages for training modules, certificate details, notification dropdown/read states, profile edit mode, and settings interactions. The current screens provide the primary presentation states and navigation foundation.

Where backend mutations do not exist, the remaining forms should use clearly separated mock adapters rather than pretending to persist data. Authenticated browser-flow testing and full mobile visual QA should be completed with real environment variables and representative volunteer/admin accounts.
