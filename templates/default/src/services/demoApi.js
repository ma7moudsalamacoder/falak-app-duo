// Demo-mode in-browser "backend".
//
// When VITE_DATA_MODE=demo the whole app runs on the bundled demo data with no
// Laravel backend or network required. This module mirrors the same routes the
// real API exposes — auth/me, auth/login, profile/settings writes, entity
// lists — and serves them from a localStorage-backed database seeded from
// src/data/demoAccounts.js and src/data/demo/*.js. Flip VITE_DATA_MODE=live and
// the app talks to the real backend again (see services/api.js).
//
// The scaffolder deletes demo modules whose features were switched off, so this
// file discovers them via import.meta.glob — only files that exist at build
// time are bundled, and nothing breaks when ones are missing.
import { decrypt } from "@/utils/crypto";

const DB_KEY = "falak_demo_db";
const TOKEN_KEY = "falak_user_token";
const SEED_VERSION = 1;

// Eager glob: resolves every demo module that exists in this scaffold.
const entityModules = import.meta.glob("../data/demo/*.js", { eager: true });
const accountModules = import.meta.glob("../data/demoAccounts.js", { eager: true });

function defaultSettings() {
  return {
    notification_preferences: {
      account: { email: true, push: true, sms: false, telegram: false },
      security: { email: true, push: true, sms: true, telegram: false },
      marketing: { email: false, push: false, sms: false, telegram: false },
      updates: { email: true, push: false, sms: false, telegram: false },
    },
    two_factor_enabled: false,
    ai_agent: {
      enabled: false,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      reasoning: false,
      system_prompt: "",
    },
    telegram: { bot_token: "", chat_id: "", username: "" },
  };
}

function buildCollections() {
  const collections = {};
  for (const [file, mod] of Object.entries(entityModules)) {
    const name = file.split("/").pop().replace(/\.js$/, "");
    const rows = Array.isArray(mod[name]) ? mod[name] : Array.isArray(mod.default) ? mod.default : null;
    if (rows) collections[name] = rows.map((row) => ({ ...row }));
  }
  return collections;
}

function buildSeedAccounts(collections) {
  const accounts = [];
  let nextId = 1;
  // Full-fidelity demo accounts (role + profile + settings) from demoAccounts.js.
  const seeded = Object.values(accountModules)[0]?.DEMO_ACCOUNTS;
  if (Array.isArray(seeded)) {
    for (const a of seeded) {
      accounts.push({
        id: nextId++,
        email: a.email || a.profile?.email || "",
        password: a.password || "password",
        role: a.role || null,
        name: a.profile?.name || "",
        phone: a.profile?.phone || "",
        country_code: a.profile?.country_code || "",
        city: a.profile?.city || "",
        channel: a.profile?.channel || "none",
        channel_handle: a.profile?.channel_handle || "",
        photo: a.profile?.photo ?? null,
        ...(a.settings || defaultSettings()),
      });
    }
  }
  // The demo `users` entity rows are also usable as login accounts.
  for (const u of collections.users || []) {
    if (accounts.some((a) => a.email === u.email)) continue;
    accounts.push({
      id: nextId++,
      email: u.email || "",
      password: "password",
      role: u.role || null,
      name: u.name || "",
      phone: "",
      country_code: "",
      city: "",
      channel: "none",
      channel_handle: "",
      photo: null,
      ...defaultSettings(),
    });
  }
  return accounts;
}

function fingerprint() {
  const entities = Object.keys(entityModules)
    .map((f) => f.split("/").pop())
    .sort()
    .join(",");
  const accounts = Object.keys(accountModules).length ? "accounts" : "";
  return [SEED_VERSION, accounts, entities].join("|");
}

let db = null;

function loadDB() {
  const fp = fingerprint();
  try {
    const raw = JSON.parse(localStorage.getItem(DB_KEY) || "null");
    if (raw && raw.fingerprint === fp) {
      db = raw;
      return db;
    }
  } catch {
    // Fall through to a fresh seed.
  }
  const collections = buildCollections();
  db = { fingerprint: fp, accounts: buildSeedAccounts(collections), collections };
  persist();
  return db;
}

function persist() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Quota/storage unavailable — keep running in-memory only.
  }
}

loadDB();

function fail(message, status = 400) {
  const error = new Error(message);
  error.response = { status, data: { message } };
  throw error;
}

function tokenFromStorage() {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  const token = decrypt(raw);
  const match = /^demo\.(\d+)$/.exec(token || "");
  return match ? match[1] : null;
}

function requireAccount() {
  const id = tokenFromStorage();
  const account = id && db.accounts.find((a) => String(a.id) === String(id));
  if (!account) fail("Unauthenticated", 401);
  return account;
}

function publicUser(account) {
  const { password, ...user } = account;
  return user;
}

function matchEntity(path) {
  const match = /^\/([a-z][a-z0-9-]*)(?:\/(\d+))?$/.exec(path);
  if (!match) return null;
  return { name: match[1], id: match[2] ? Number(match[2]) : null };
}

function getEntityRows(name) {
  if (!db.collections[name]) db.collections[name] = [];
  return db.collections[name];
}

function nextId(rows) {
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

function base32Secret() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let out = "";
  for (let i = 0; i < 16; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out.match(/.{4}/g).join(" ");
}

function recoveryCodes() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codes = new Set();
  while (codes.size < 6) {
    let code = "";
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    code += "-";
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    codes.add(code);
  }
  return [...codes];
}

function overview() {
  const stats = {
    users: db.accounts.length,
    orders: (db.collections.orders || []).length,
    products: (db.collections.products || []).length,
    revenue: (db.collections.orders || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0),
  };
  return {
    mode: "demo",
    stats,
    entities: Object.keys(db.collections).map((name) => {
      const rows = getEntityRows(name);
      const first = rows[0];
      let preview = "";
      if (first) {
        preview = Object.entries(first)
          .filter(([key]) => key !== "id")
          .slice(0, 3)
          .map(([, value]) => String(value))
          .join(" · ");
      }
      return { name, count: rows.length, preview };
    }),
    signInHint: {
      email: db.accounts[0]?.email || "",
      password: db.accounts[0]?.password || "password",
    },
  };
}

const demoApi = {
  async get(url) {
    const path = (url || "").split("?")[0];
    if (path === "/auth/me") return { data: publicUser(requireAccount()) };
    if (path === "/overview") return { data: overview() };
    const entity = matchEntity(path);
    if (entity) return { data: [...getEntityRows(entity.name)] };
    fail(`Demo backend: no GET handler for ${path}`, 404);
  },

  async post(url, body = {}) {
    const path = (url || "").split("?")[0];
    switch (path) {
      case "/auth/login": {
        const identifier = String(body.identifier || "").trim().toLowerCase();
        const password = String(body.password || "");
        const account = db.accounts.find(
          (a) =>
            a.email?.toLowerCase() === identifier || String(a.phone || "").trim() === String(body.identifier || "").trim()
        );
        if (!account || account.password !== password) fail("Invalid credentials", 401);
        return { data: { token: `demo.${account.id}`, user: publicUser(account) } };
      }
      case "/auth/register": {
        const email = String(body.email || "").trim().toLowerCase();
        if (db.accounts.some((a) => a.email?.toLowerCase() === email)) fail("Email already registered", 422);
        const account = {
          id: nextId(db.accounts),
          email,
          phone: String(body.phone || "").trim(),
          name: String(body.name || "").trim(),
          role: body.role ?? null,
          password: String(body.password || "password"),
          channel: "none",
          channel_handle: "",
          photo: null,
          ...defaultSettings(),
        };
        db.accounts.push(account);
        persist();
        return { data: { token: `demo.${account.id}`, user: publicUser(account) } };
      }
      case "/auth/logout":
        return { data: {} };
      case "/auth/forgot-password":
        return { data: {} };
      case "/auth/reset-password":
        return { data: {} };
      case "/auth/change-password": {
        const account = requireAccount();
        account.password = String(body.new_password || account.password);
        persist();
        return { data: {} };
      }
      case "/auth/2fa/enable": {
        const account = requireAccount();
        account.two_factor_method = String(body.method || "app");
        account.two_factor_secret = base32Secret();
        account.two_factor_challenge = true;
        persist();
        return { data: { secret: account.two_factor_secret, challenge: account.two_factor_challenge } };
      }
      case "/auth/2fa/verify": {
        const account = requireAccount();
        account.two_factor_enabled = true;
        account.two_factor_challenge = false;
        account.two_factor_recovery_codes = recoveryCodes();
        persist();
        return { data: publicUser(account) };
      }
      case "/auth/2fa/disable": {
        const account = requireAccount();
        account.two_factor_enabled = false;
        account.two_factor_secret = "";
        account.two_factor_challenge = false;
        persist();
        return { data: publicUser(account) };
      }
      case "/auth/telegram/test":
        // Demo: always succeeds so the dialog can be exercised to completion.
        return { data: { ok: true, message: "Sent (demo)" } };
      default: {
        const social = /^\/auth\/social\/([a-z]+)$/.exec(path);
        if (social) return { data: { url: "" } }; // never navigate away in demo mode
        const entity = matchEntity(path);
        if (entity) {
          const rows = getEntityRows(entity.name);
          const record = { id: nextId(rows), ...body };
          rows.push(record);
          persist();
          return { data: record };
        }
        fail(`Demo backend: no POST handler for ${path}`, 404);
      }
    }
  },

  async put(url, body = {}) {
    const path = (url || "").split("?")[0];
    if (path === "/auth/me") {
      const account = requireAccount();
      for (const key of ["name", "email", "phone", "country_code", "city", "channel", "channel_handle", "photo"]) {
        if (key in body) account[key] = body[key];
      }
      persist();
      return { data: publicUser(account) };
    }
    if (path === "/auth/notifications") {
      const account = requireAccount();
      account.notification_preferences = body.preferences || account.notification_preferences;
      persist();
      return { data: publicUser(account) };
    }
    if (path === "/auth/ai-agent") {
      const account = requireAccount();
      account.ai_agent = { ...account.ai_agent, ...body };
      persist();
      return { data: publicUser(account) };
    }
    if (path === "/auth/telegram") {
      const account = requireAccount();
      account.telegram = { ...account.telegram, ...body };
      persist();
      return { data: publicUser(account) };
    }
    const entity = matchEntity(path);
    if (entity?.id !== null) {
      const rows = getEntityRows(entity.name);
      const index = rows.findIndex((row) => Number(row.id) === entity.id);
      if (index === -1) fail("Not found", 404);
      rows[index] = { ...rows[index], ...body, id: entity.id };
      persist();
      return { data: rows[index] };
    }
    fail(`Demo backend: no PUT handler for ${path}`, 404);
  },

  async delete(url) {
    const entity = matchEntity((url || "").split("?")[0]);
    if (entity?.id !== null) {
      const rows = getEntityRows(entity.name);
      const index = rows.findIndex((row) => Number(row.id) === entity.id);
      if (index === -1) fail("Not found", 404);
      rows.splice(index, 1);
      persist();
      return { data: { ok: true } };
    }
    fail(`Demo backend: no DELETE handler for ${url}`, 404);
  },
};

export default demoApi;