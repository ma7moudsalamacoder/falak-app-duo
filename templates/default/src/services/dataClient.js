// Single source of truth for the app's data source.
//
//   VITE_DATA_MODE=demo -> api calls are served by the in-browser demo backend
//                          (services/demoApi.js) from the bundled demo data.
//   VITE_DATA_MODE=live -> every call goes to the Laravel backend (api.js).
//
// Stores and views import `client` (never `api` or `demoApi` directly) so the
// whole app flips between demo and live with one env var.
import api from "./api";
import demoApi from "./demoApi";

export const DATA_MODE = import.meta.env.VITE_DATA_MODE === "demo" ? "demo" : "live";
export const isDemoMode = DATA_MODE === "demo";

export const client = isDemoMode ? demoApi : api;

// Generic entity access used by pages that render data grids/lists. In live
// mode this maps to GET /<entity> on your backend; in demo mode it reads the
// corresponding src/data/demo/<entity>.js collection.
export function getList(entity, params) {
  return client.get(`/${entity}`, { params });
}