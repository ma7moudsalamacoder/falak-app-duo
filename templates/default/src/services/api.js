import axios from "axios";
import { decrypt } from "@/utils/crypto";

/**
 * Central client for talking to the Laravel backend.
 *
 * Auth model (two headers on every request):
 *   - X-API-Key    : static key identifying *this client app* (set per environment,
 *                    checked by an app-level middleware before anything else runs).
 *   - Authorization: `Bearer <user token>` issued at login, identifying the *user*.
 *
 * This mirrors a common Laravel Sanctum-style setup where the API key gates which
 * apps may talk to the API at all, and the bearer token scopes the request to a user.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "X-API-Key": import.meta.env.VITE_API_KEY,
  },
});

api.interceptors.request.use((config) => {
  // Read the token straight from storage (not the Pinia store) to avoid a
  // circular import between this file and stores/auth.js.
  const raw = localStorage.getItem("falak_user_token");
  if (raw) {
    const token = decrypt(raw);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;
export function registerUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
