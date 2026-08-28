# Super Admin E2E (Playwright)

Tests for the LYXA Super Admin panel, split into two navigation flows:

- `tests/admin/admin-nav-part1.spec.ts` — Dashboard → Orders → Parents → Shops → Users → Riders → Financials
- `tests/admin/admin-nav-part2.spec.ts` — Team → Display → Settings → Chat → Marketing

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env        # then fill in ADMIN_EMAIL / ADMIN_PASSWORD
```

## Run

```bash
npm test                 # all specs (headless)
npm run test:headed      # watch in a browser
npm run test:ui          # Playwright UI mode (best for debugging)
npm run report           # open the HTML report

# run one spec:
npx playwright test tests/admin/admin-nav-part1.spec.ts --headed
```

## How auth works

`src/consoles/admin/auth.setup.ts` is a `setup` project that logs in once and
saves the session to `.auth/admin.json`. The `admin` project reuses that
session via `storageState`, so individual specs don't log in again.

## Project layout

```
src/
  config/env.ts                 # reads ADMIN_EMAIL / ADMIN_PASSWORD from .env
  core/BasePage.ts              # generic page-object base
  consoles/admin/
    AdminApp.ts                 # aggregates all pages + components
    admin.fixture.ts            # `admin` + `step` test fixtures
    auth.setup.ts               # logs in once, saves storageState
    components/
      AdminSidebar.ts           # left-nav navigation (goTo / goToSub)
      AdminLoginPage.ts         # sign-in form
      TabBar.ts                 # generic tab strip
    config/admin.routes.ts      # route paths
    selectors/admin.selectors.ts# headings, tab labels
    pages/                      # one page object per nav item (stubs)
tests/admin/                    # the two spec files
```

## ⚠ Before the first green run

These are best-guess locators marked `⚠` in the code — verify against the
real DOM and adjust (same process used to build the Shop console):

1. **Login form** (`AdminLoginPage.ts` / `auth.setup.ts`) — email / password /
   submit selectors.
2. **Sidebar** (`AdminSidebar.ts`) — the drawer toggle and link locators.
3. **Routes** (`config/admin.routes.ts`) — the real URL for each section.
4. **Headings / tabs** (`selectors/admin.selectors.ts`) — the actual page
   heading text and tab labels.

As each real screen is confirmed, add CRUD methods to that page object and
wire them into the matching spec.
