# AGENTS.md

## What this repo is

A Node ESM CLI (`bin/index.js`, name `falak-app`) that scaffolds a Vue 3 app by
copying `templates/default/`. The repo is **not** a Vue app — the actual app
(and its own `package.json` with Vue/Pinia/axios deps) lives entirely in
`templates/default/`. Root `package.json` deps only cover the CLI
(chalk, commander, fs-extra, prompts).

## Commands

- No lint, test, or typecheck scripts exist anywhere (root or template).
- Run the CLI: `node bin/index.js <name> --yes` (interactive if no `--yes`).
- Smoke-test by scaffolding into a temp dir, then
  `cd <name> && npm install && npm run build` inside the generated project.
- Right package: root runs the scaffolder; `templates/default/` is the Vue app.

## Scaffolder invariants (edit carefully)

- `bin/index.js` copies the template, rewrites the copied `package.json`
  `name`, deletes unselected service files, and generates `.env` from
  `.env.example` by substituting `__API_BASE_URL__`, `__AES_KEY__` (32-byte
  hex), `__AES_IV__` (16-byte hex). Any new generated env var must follow this
  placeholder → `.replace()` convention.
- `src/services/ably.js` and `src/services/brevo.js` are **deleted** when a
  user deselects the service. Template code must only import them on demand
  (never statically at module load), or account for the deletion.
- Keep `ably.js` wiring channel auth through the shared `api` axios client
  (`api.post("/broadcasting/auth")`) — the same `X-API-Key` + bearer headers
  gate realtime auth.

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

Arabic is the default locale (`ar`), set on load in `src/i18n/index.js`;
`setLocale` flips `document.documentElement.dir` between `rtl`/`ltr`.
`postcss-rtlcss` mirrors Tailwind utility classes when `dir="rtl"`. Test UI
with RTL in mind.