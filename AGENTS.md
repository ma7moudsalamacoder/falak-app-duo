# AGENTS.md

## What this repo is

A Node ESM CLI (`bin/falak-app-duo`, name `falak-app`) that scaffolds a Vue 3 app by
copying `templates/default/`. The repo is **not** a Vue app — the actual app
(and its own `package.json` with Vue/Pinia/axios deps) lives entirely in
`templates/default/`. Root `package.json` deps only cover the CLI
(chalk, commander, fs-extra, prompts, figlet, gradient-string).

## Commands

- No lint, test, or typecheck scripts exist anywhere (root or template).
- Run the CLI: `node bin/falak-app-duo <name> --yes` (interactive if no `--yes`).
- The interactive flow asks which languages the app should ship with (English is
  always included; Arabic is the default extra and the RTL language). `--no-rtl`
  forces Arabic out (LTR only). Scaffolding slices the app to exactly the
  selected languages: `index.html` → `lang`/`dir` match; `src/i18n/index.js` is
  regenerated with only the chosen bundles; unselected `locales/*.json` are
  deleted; and when only English remains the language switcher is stripped from
  `App.vue`. Keep the `App.vue` strings `import { setLocale, SUPPORTED_LOCALES }`,
  `const { t, locale } = useI18n();`, `const locales = SUPPORTED_LOCALES;`, and
  the `<select v-if="locales.length > 1">` switcher stable or the replacements
  silently break.
- The interactive flow additionally asks about UserRole support (roles
  `master`/`super_admin`/`admin`/`user`), demo accounts, and demo-data
  entities. Providing any of `--roles`/`--demo-accounts`/`--demo-data` skips
  those prompts (services/languages/API URL then use defaults); `--yes` runs
  with the minimal scaffold (roles/demo all off) and auto-installs. When a
  feature flag is used the post-scaffold "how to start" prompt is skipped and
  dependencies are installed automatically.
- After scaffolding the CLI prompts to auto-run `npm install` (and optionally
  `npm run dev`); `--yes` runs `npm install` automatically. Don't add install
  logic elsewhere.
- Smoke-test by scaffolding into a temp dir, then
  `cd <name> && npm install && npm run build` inside the generated project.
- `main()` in `bin/falak-app-duo` is only run when `isMain()` matches: it
  compares `realpathSync(process.argv[1])` to `import.meta.url`. This exists so
  the CLI can be imported as a library (tests use `buildI18nModule`), but
  `npx`/`npm exec` spawn the bin through the `node_modules/.bin/<name>` symlink,
  so a naive `argv[1] === import.meta.url` check silently skips `main()`. Keep
  the `realpathSync` comparison (and the `try/catch` for import cases) or npx
  installs produce no output and exit immediately. Test real npx spawns with
  `npm exec --yes --package=<packed-tarball> -- falak-app-duo <name>` via a pty.
- Right package: root runs the scaffolder; `templates/default/` is the Vue app.

## Scaffolder invariants (edit carefully)

- `bin/falak-app-duo` copies the template, rewrites the copied `package.json`
  `name`, deletes unselected service files, and generates `.env` from
  `.env.example` by substituting `__API_BASE_URL__`, `__AES_KEY__` (32-byte
  hex), `__AES_IV__` (16-byte hex), and `__DATA_MODE__` (`demo` when demo
  accounts or demo data were selected, else `live`). Any new generated env var
  must follow this placeholder → `.replace()` convention.
- `src/services/ably.js` and `src/services/brevo.js` are **deleted** when a
  user deselects the service. Template code must only import them on demand
  (never statically at module load), or account for the deletion.
- Roles, demo accounts, and demo data are opt-in (interactive prompts or
  `--roles <list>`, `--demo-accounts`, `--demo-data <list>`); `--yes` keeps
  them all OFF. Slicing:
  - `src/data/roles.js` is **always rewritten** via `buildRolesModule()` —
    kept to the picked role subset, or an empty `ROLES = []` when off.
    `Register.vue`, `Profile.vue`, and the auth store import it statically, so
    it must never be deleted. `Register.vue` shows its role `<select>` when
    `ROLES.length > 1` and only adds `role` to the register payload when
    `ROLES.length`; keep that contract.
  - `src/data/demoAccounts.js` is rewritten by `buildDemoAccountsModule()` to
    one account per picked role (or a single normal demo user when roles are
    off) and **deleted** when dummy accounts aren't wanted. In demo mode
    `src/services/demoApi.js` globs it (via `import.meta.glob` — safely absent)
    and exposes each account as a login-able user.
  - `src/data/demo/*.js` are per-entity static modules; unselected entities
    are deleted and the whole `demo/` dir is removed when demo data is off.
    `demoApi.js` discovers them with `import.meta.glob`, so deleted/kept
    module sets both build fine — never import a demo module by a fixed path.
  - Demo account data carries `profile` (name/phone/country/city/channel) plus
    `settings` (`notification_preferences`, `two_factor_enabled`, `ai_agent`,
    `telegram`) mirroring the settings dialogs' field shapes.
- Data mode (`VITE_DATA_MODE`, set by the scaffolder): `demo` runs the whole
  app on bundled demo data, `live` calls the Laravel API. `service/dataClient.js`
  exports `client` (`demoApi` or `api`) plus `DATA_MODE`/`isDemoMode` — the
  auth store and any page that fetches data must import `client` from
  `@/services/dataClient`, never `api`/`demoApi` directly, so the switch stays
  a one-var flip. The demo backend mirrors backend routes in-browser from a
  localStorage DB (`falak_demo_db`, re-seeded when the seed fingerprint
  changes): auth (login/register/me/logout/password), profile/settings writes
  (notifications, AI agent, telegram, 2FA), `GET /overview` (Home stats + entity
  previews), and generic entity CRUD (`/products`, `/orders`, …). Keep the
  demo DB account shape compatible with what `Profile.vue` and the settings
  dialogs read off `auth.user`.
- Role labels are vue-i18n keys (`roles.*.title`) — a new role needs a key in
  ALL 7 bundles (see i18n section).
- Keep `ably.js` wiring channel auth through the shared `api` axios client
  (`api.post("/broadcasting/auth")`) — the same `X-API-Key` + bearer headers
  gate realtime auth.
- Settings live on ONE authed route `src/views/SettingsView.vue` (`/settings`);
  each section (security, two-factor, notifications, AI agent, telegram) opens
  as a dialog. The dialog bodies are `src/components/settings/*Dialog.vue`
  rendered inside the shared `SettingsDialog.vue` modal shell (Teleport,
  Esc/overlay close, scroll lock). Don't reintroduce separate settings routes or
  navigation links for individual sections; `App.vue` lists only Profile and
  Settings in its nav. `SecurityDialog` swaps to the two-factor dialog by
  emitting `open-two-factor` (no RouterLink).

## Auth / security model (do not break)

- Every request from `src/services/api.js` sends `X-API-Key` (app) +
  `Authorization: Bearer <user token>` (user).
- `api.js` reads the token straight from `localStorage` key `falak_user_token`
  to avoid a circular import with `src/stores/auth.js`. Preserve this.
- User token is cached AES-256-CBC (CryptoJS) encrypted using
  `VITE_AES_KEY`/`VITE_AES_IV`; `src/utils/crypto.js` refuses to encrypt when
  they're unset. Never add a plaintext localStorage secret.

## Removed integrations — do NOT reintroduce

Firebase and Paymob are gone for good, and Groq is backend-only (frontend calls
the Laravel endpoint through `api`). Brevo's API key is a backend secret — it
never ships to the browser; client code only calls your own `/brevo/*` routes.

## i18n / RTL

Arabic is the default locale (`ar`) when it ships, set on load in
`src/i18n/index.js`; the generated module exports `SUPPORTED_LOCALES` (the
drop-down choices in `App.vue`) and `setLocale` flips
`document.documentElement.dir` between `rtl`/`ltr` (`"ar"` is the only RTL
locale — everything else is LTR). `postcss-rtlcss` mirrors Tailwind utility
classes when `dir="rtl"`. Test UI with RTL in mind. All 7 bundles
(`ar`, `de`, `en`, `es`, `fr`, `ru`, `it`) must keep identical key structure —
a new key in one JSON must exist in all of them.

## Light / dark theming (do not break)

- Dark is the default (`<html>` has no class); light is applied by toggling
  `.light` on `<html>`. `src/theme.js` owns the logic (localStorage
  `falak_theme`, else OS `prefers-color-scheme`, else dark) and the FOUC guard
  duplicating it lives inline in `index.html <head>` — keep the two in sync.
  The header toggle in `App.vue` is the only theme UI. `setLocale` must keep
  using `classList`/`dir`, never rewriting `<html>` classes, so the theme class
  survives a language switch.
- **All colors go through semantic tokens** defined once in
  `src/assets/main.css` (`:root` = dark, `html.light` = light) and wired into
  `tailwind.config.js`: `page`/`page2` (backgrounds), `glass`/`glass2`/`glass3`
  (translucent white fills at rising alpha), `edge`/`edge2`/`edge3` (borders),
  `ink`/`ink2`/`ink3`/`mute` (text), plus `--grid-dot`/`--vignette`/`--ripple`/
  `--scroll-thumb`. Never hardcode `text-white`, `text-gray-*`, `bg-white/*`,
  `border-white/*`, `bg-[#0b0f19]`, `bg-[#0d1520]` in components — map to the
  token instead. White stays only on saturated brand fills (`btn-primary`,
  `btn-accent`, emerald/cyan gradients, the F/"AI" logo badges).
- The pale soft-accent shades `emerald/teal/cyan/sky/amber/orange/rose`
  `200`-`300` are **remapped through CSS vars** (glow on dark, deepened for
  light) so `text-emerald-300`, `text-gradient`, role badges and status pills
  adapt automatically. Shade `400`+ keeps the stock Tailwind palette. When
  adding new pale accent text, reuse an existing remapped shade or add a token
  to both `:root` and `html.light` and the matching `extend.colors` entry.
- The scaffolder only rewrites the `<html lang dir>` opening tag in
  `index.html`, so the inline theme script is safe; the English-only slice
  regex still strips the language `<select>` from `App.vue` — keep that
  `<select v-if="locales.length > 1">` block intact.