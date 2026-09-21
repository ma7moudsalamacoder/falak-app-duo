# falak-app-duo

Vue 3 boilerplate scaffolder. Firebase-free, with Groq moved fully to the
backend and Paymob dropped for good. "Duo" = the two remaining bundled
integrations on the frontend side: **Ably** (realtime) and **Brevo**
(email/SMS, proxied through Laravel).

| | Status |
|---|---|
| Firebase | Removed |
| Groq (AI) | Removed from frontend — backend-only now, no client code here |
| Paymob (payments) | Removed for good |
| Ably (realtime) | **New** — via Laravel Echo, authorized through the same API-key + user-token headers as the rest of the app |
| Brevo (email/SMS) | Kept — calls go through Laravel, key never ships to the browser |
| Laravel API auth | `X-API-Key` (app) + `Authorization: Bearer <token>` (user) |
| AES-256 | Kept — encrypts the cached user token in IndexedDB |
| Arabic/RTL | Kept — baked in via vue-i18n + postcss-rtlcss (opt-out: `--no-rtl` or the RTL prompt) |

## Install & run

Published on npm under both `falak-app-duo` and the `@ma7moudsalama` org scope.
No install needed — run it straight with `npx`:

```bash
npx falak-app-duo my-project          # interactive prompts
npx falak-app-duo my-project --yes    # all defaults: Ably + Brevo, localhost API, RTL on
npx falak-app-duo my-project --no-rtl # default locale becomes English/LTR
```

Or install the CLI globally once:

```bash
npm install -g falak-app-duo
falak-app-duo my-project
```

The org-scoped equivalent is `npx @ma7moudsalama/falak-app-duo my-project`.

## Auth model

Every request from `src/services/api.js` carries two headers:

- `X-API-Key` — identifies this client app, set once per environment in `.env`.
- `Authorization: Bearer <user token>` — identifies the logged-in user, issued
  by your Laravel `/auth/login` endpoint and stored AES-256 encrypted in
  IndexedDB (see `src/utils/crypto.js`, `src/storage.js` and `src/stores/auth.js`).

## Ably (realtime)

`src/services/ably.js` wraps Laravel Echo with the `ably` broadcaster. Private
and presence channels are authorized via a custom `authorizer` that routes
through the shared `api` axios client (`POST /broadcasting/auth`) instead of
a bare fetch — so the same `X-API-Key` + bearer token gate realtime auth too.

Backend needs:
```php
// config/broadcasting.php
'default' => 'ably',
'connections' => ['ably' => ['driver' => 'ably', 'key' => env('ABLY_KEY')]],
```
plus `BroadcastServiceProvider` registered so `/broadcasting/auth` exists.
Only the **public** half of your Ably key goes in the frontend `.env`
(`VITE_ABLY_PUBLIC_KEY`) — the secret half stays server-side.

```js
import { listenPrivate, joinPresence } from "@/services/ably";

listenPrivate(`App.Models.User.${userId}`, ".OrderUpdated", (e) => { ... });
joinPresence("chat-room-1", { here: (users) => { ... } });
```

## Brevo (email/SMS)

`src/services/brevo.js` only calls your own Laravel routes — Brevo's API key
is a backend secret and never ships to the browser.

## Groq

No frontend code at all now — the backend calls Groq directly and exposes
whatever endpoint(s) your app needs (e.g. `POST /api/ai/chat`). Call that
endpoint through the shared `api` client wherever you need it; there's
nothing to scaffold on the client side for it.

## Backend routes this frontend expects

```
POST /api/auth/login   -> { token, user }
POST /api/auth/logout
GET  /api/auth/me      -> user
POST /api/broadcasting/auth   (Ably/Echo channel authorization)
POST /api/brevo/email  | /api/brevo/sms | /api/brevo/contacts
```
plus an `X-API-Key` middleware gating all of the above, and Sanctum (or
similar) validating the bearer token for user-scoped routes.

## What the CLI does

1. Prints a gradient **Falak Duo** banner.
2. In interactive mode asks which services to wire up (**Ably** and/or
   **Brevo**), the Laravel API base URL, and whether to enable **Arabic/RTL**
   by default. `--yes` takes all defaults; `--no-rtl` skips the RTL choice and
   defaults to English/LTR.
3. Copies `templates/default` into `my-project/`, strips the service files you
   didn't select, and generates a real `.env` from `.env.example` with a fresh
   random AES-256 key + IV and your chosen API base URL.
4. Offers to run `npm install` and start the dev server for you (`--yes` runs
   `npm install` automatically).

To start a scaffolded project on your own:

```bash
cd my-project
npm install
npm run dev
```

Fill in `VITE_API_KEY` and `VITE_ABLY_PUBLIC_KEY` in `.env` before running
against a real backend.
