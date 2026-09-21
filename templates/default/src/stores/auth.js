import { defineStore } from "pinia";
import { encrypt, decrypt } from "@/utils/crypto";
import { client } from "@/services/dataClient";
import storage from "@/storage";

const STORAGE_KEY = "falak_user_token";

function loadToken() {
  const raw = storage.getSync(STORAGE_KEY);
  if (!raw) return null;
  try {
    return decrypt(raw) || null;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userToken: loadToken(),
    user: null,
  }),
  getters: {
    // Role is part of the user account; comes from the API user payload
    // (or was picked at registration when UserRole support is enabled).
    role: (state) => state.user?.role || null,
  },
  actions: {
    setToken(token) {
      this.userToken = token;
      storage.set(STORAGE_KEY, encrypt(token));
    },
    clearToken() {
      this.userToken = null;
      this.user = null;
      storage.remove(STORAGE_KEY);
    },
    // Two-header auth: X-API-Key identifies the *app*, Authorization Bearer
    // identifies the *user*. Both are required by the Laravel API middleware.
    async login(identifier, password) {
      // `identifier` is either an email or a phone number — send it as "identifier"
      // so the backend can decide, or normalize it here depending on your API.
      const { data } = await client.post("/auth/login", {
        identifier: identifier.trim(),
        password,
      });
      this.setToken(data.token);
      this.user = data.user;
      return data.user;
    },
    async logout() {
      try {
        await client.post("/auth/logout");
      } finally {
        this.clearToken();
      }
    },
    async fetchProfile() {
      const { data } = await client.get("/auth/me");
      this.user = data;
      return data;
    },

    // ---- Create account / recover password ----
    async register(payload) {
      const { data } = await client.post("/auth/register", payload);
      if (data.token) {
        this.setToken(data.token);
        this.user = data.user;
      }
      return data;
    },
    async forgotPassword(identifier) {
      return client.post("/auth/forgot-password", { identifier });
    },
    async resetPassword(payload) {
      return client.post("/auth/reset-password", payload);
    },
    // Social login: opens the provider's OAuth URL returned by the backend.
    async socialLogin(provider) {
      const { data } = await client.post(`/auth/social/${provider}`);
      if (data?.url) window.location.href = data.url;
      return data;
    },

    // ---- Profile ----
    async updateProfile(payload) {
      const { data } = await client.put("/auth/me", payload);
      this.user = data;
      return data;
    },
    async changePassword(currentPassword, newPassword) {
      return client.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
    },

    // ---- 2FA ----
    async enable2FA(methods = []) {
      const { data } = await client.post("/auth/2fa/enable", { methods });
      return data;
    },
    async verify2FA(code) {
      const { data } = await client.post("/auth/2fa/verify", { code });
      this.user = data;
      return data;
    },
    async disable2FA(code) {
      const { data } = await client.post("/auth/2fa/disable", { code });
      this.user = data;
      return data;
    },

    // ---- Settings ----
    async updateNotifications(preferences) {
      const { data } = await client.put("/auth/notifications", { preferences });
      this.user = data;
      return data;
    },
    async updateAIAgent(config) {
      const { data } = await client.put("/auth/ai-agent", config);
      this.user = data;
      return data;
    },
    async updateTelegram(config) {
      const { data } = await client.put("/auth/telegram", config);
      this.user = data;
      return data;
    },
    async testTelegram() {
      return client.post("/auth/telegram/test");
    },
  },
});