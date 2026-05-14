# Ansar CRMS Architecture Study

## Current Stack

- Vite 6, React 18, JavaScript, React Router 7.
- UI libraries are mixed: MUI, React Bootstrap, Bootstrap CSS, React Icons.
- API integration is mostly direct `axios` or `fetch` calls inside pages/components.
- Auth/session state is stored directly in `localStorage`.
- Backend is Django, with API base configured in `src/utils/baseUrl.js`.
- PWA/push notification support is custom through `public/sw.js`, `public/service-worker.js`, `src/firebase.js`, and direct WebSocket/EventSource use.

## Operating Notes

- The current owner is still studying the inherited repo, so architecture changes should stay incremental and documented.
- Use `D:\Dichit\dichit-frontend` as the reference frontend for architecture and code patterns where this Ansar repo has no clear local pattern.
- Treat the existing role folders as v1. New architecture work should live under `src/V2`.

## Current Folder Model

```text
src/
  Admin/       admin pages, admin layout, dashboard, user/request/complaint management
  Staff/       tech support staff pages and layout
  TechAdmin/   tech-admin pages and routes
  User/        department head/staff user pages, layout, and duplicated admin-like components
  common/      landing/login, theme, notification bell, not found
  utils/       base URL, notification helpers
```

`projectDetails.txt` says the intended roles are:

- `Admin` folder: admin.
- `User` folder: department head and staff.
- `Staff` folder: tech support, but it should be renamed to match the role.

## Main Architecture Problems

1. The local `.codex` context is for a different DICHIT frontend. It describes TypeScript, pnpm, React 19, Ant Design, RTK Query, and route folders that this project does not have.
2. Routing is spread across role folders, and route protection is duplicated per role.
3. `src/App.jsx` imports `TechAdminRoutes` from `TechAdminProtectedRoute.jsx`, so `/tech-admin/*` does not load the route tree.
4. `TechAdminProtectedRoute.jsx` has a nested duplicate function and never completes its loading state.
5. Auth token keys are inconsistent: `access_token`, `admin_access_token`, `user_access_token`, `ts_access_token`, `tech_access_token`, plus mixed `role` and `user_role`.
6. API URLs are hardcoded through `BASE_URL = "https://support.ansar.in/api"` and many callers append another `/api`, creating inconsistent endpoint composition.
7. WebSocket URLs are hardcoded to `ws://127.0.0.1:8001`.
8. API calls, response shaping, loading/error state, and rendering are mixed in large components.
9. Admin and User component folders contain copied or near-copied files.
10. Styling is global and mixed between Bootstrap CSS, MUI `sx`, inline styles, and local CSS files.
11. Lint currently fails with 264 errors. Some are style-only, but several expose real runtime risks such as undefined setters and invalid route protection.
12. Production build works, but the bundle is large: `main` JavaScript is about 970 kB before gzip.

## Target Clean Architecture

The safest target is a feature-first structure with shared infrastructure:

```text
src/
  V2/
    app/
      router/
        paths.js
        AppRouter.jsx
        ProtectedRoute.jsx
      providers/
        AppProviders.jsx

    config/
      env.js
      firebase.js

    services/
      api/
        httpClient.js
        auth.api.js
        users.api.js
        requests.api.js
        complaints.api.js
        dashboard.api.js
      realtime/
        notificationsSocket.js
        requestEvents.js

    features/
      auth/
      dashboard/
      requests/
      complaints/
      users/
      profile/
      notifications/

    layouts/
      AdminLayout.jsx
      UserLayout.jsx
      TechSupportLayout.jsx

    shared/
      components/
      hooks/
      constants/
      utils/
      styles/
```

## Refactor Order

1. Stabilize routing and auth.
   - Fix the tech-admin route import.
   - Replace duplicated role guards with one `ProtectedRoute`.
   - Standardize token/session keys behind a small `authSession` utility.

2. Centralize environment and API access.
   - Replace `src/utils/baseUrl.js` with Vite env-backed config under `src/V2/config`.
   - Add one axios client with auth headers and 401 handling.
   - Move endpoint calls out of components into service files.

3. Remove duplicated feature code.
   - Start with requests and complaints because they have the largest duplicated files.
   - Keep role-specific pages thin and pass role/config into shared feature components.

4. Clean UI foundations.
   - Pick MUI as the primary component system because it is already used across forms/layouts.
   - Keep Bootstrap temporarily only where replacing it would create risk.
   - Move global table/button overrides into scoped components or feature CSS.

5. Improve UX by role.
   - Admin/tech-admin: dense operational pages with filters, status tabs, tables, drawers, and clear batch actions.
   - User/department staff: simpler task-first pages with clear request/complaint submission and status tracking.
   - Tech support: queue-oriented workflow with status transitions, delay/completion notes, and notification context.

6. Add validation safety.
   - Make `npm run lint` pass in stages.
   - Add focused tests around auth routing, API client behavior, and request/complaint service logic.
   - Keep `npm run build` passing after every phase.

## First Implementation Slice

The first code slice should be small and high impact:

- Create `src/V2/shared/constants/storageKeys.js`.
- Create `src/V2/shared/utils/authSession.js`.
- Create `src/V2/app/router/ProtectedRoute.jsx`.
- Fix `/tech-admin/*` to import `TechAdminRoutes.jsx`.
- Replace the broken tech-admin guard with the shared guard.
- Update login/logout paths to use the same session utility.

This gives a stable base before moving API and UI code.

## First Pass Update

Implemented:

- Mode-specific Vite env files:
  - `.env.development`
  - `.env.staging`
  - `.env.production`
  - `.env.example`
- Central env reader: `src/V2/config/env.js`.
- Shared role constants: `src/V2/shared/constants/roles.js`.
- Shared storage keys: `src/V2/shared/constants/storageKeys.js`.
- Shared session helper: `src/V2/shared/utils/authSession.js`.
- Shared route guard: `src/V2/app/router/ProtectedRoute.jsx`.
- Single route table and router:
  - `src/V2/app/router/routeConfig.jsx`
  - `src/V2/app/router/AppRouter.jsx`
- `src/App.jsx` now delegates routing to `AppRouter`.
- Header logout and notification WebSocket setup now read from shared session/env helpers.

Versioning note:

- Existing role folders are treated as v1 implementation surfaces.
- New architecture primitives live under `src/V2` so future refactors can be isolated and easier to review.

Role route ownership after first pass:

- Staff/Teacher: `/user/*` with `UserLayout`.
- Technical Staff: `/tech-support/*` with `StaffLayout`.
- Super Admin: `/admin/*` with the current admin layout.
- Department Admin: `/tech-admin/*` is wired as a guarded placeholder for the next phase. It also supports the legacy `Tech Support + is_admin` login shape.

Still pending:

- Consolidate duplicated old route files or remove them after manual verification.
- Move API calls from components into `src/V2/services`.
- Standardize API endpoint composition; many current calls still mix `BASE_URL` with `/api`.
- Add the future department admin login/role flow when backend support is ready.

## DICHIT-Aligned V2 Foundation

Added after comparing against `D:\Dichit\dichit-frontend`:

- Route paths:
  - `src/V2/app/router/paths.js`
  - `src/V2/app/router/routeConfig.jsx` now reads from central paths.
- App providers:
  - `src/V2/app/providers/AppProviders.jsx`
  - wraps the app with Redux.
- Redux foundation:
  - `src/V2/redux/store/index.js`
  - `src/V2/redux/rootReducer.js`
  - `src/V2/redux/hooks.js`
  - `src/V2/redux/reducers/auth/`
  - `src/V2/redux/reducers/ui/`
- API foundation:
  - `src/V2/services/api/Api.config.js`
  - `src/V2/services/api/httpClient.js`
  - `src/V2/services/api/Api.service.js`
  - `src/V2/services/api/endpoints/auth.api.js`
  - `src/V2/services/api/rtk/baseApi.js`
- Common hooks:
  - `src/V2/hooks/useBoolean.js`
  - `src/V2/hooks/useDebouncedValue.js`
  - `src/V2/hooks/useUrlState.js`
  - `src/V2/hooks/usePaginationState.js`
- Formatting/linting:
  - `.prettierrc`
  - `.prettierignore`
  - `prettier` dev dependency
  - `format`, `format:check`, and `lint:v2` scripts.

V2 UI and styling baseline:

- Ant Design is the V2 component library.
- Tailwind CSS is the V2 utility styling layer.
- Tailwind preflight is disabled for now so v1 Bootstrap/MUI pages are not globally reset.
- Ant Design theme tokens live in `src/V2/theme/antdTheme.js`.
- Tailwind tokens live in `tailwind.config.js`.

Auth screens now use the V2 API wrapper first. Legacy page-level API calls still remain and should
be migrated feature by feature.
