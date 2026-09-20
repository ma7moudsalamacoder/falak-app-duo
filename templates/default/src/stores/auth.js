import { defineStore } from "pinia";
import { encrypt, decrypt } from "@/utils/crypto";
import api from "@/services/api";

const STORAGE_KEY = "falak_user_token";

function loadToken() {
  const raw = localStorage.getItem(STORAGE_KEY);
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
  actions: {
    setToken(token) {
      this.userToken = token;
      localStorage.setItem(STORAGE_KEY, encrypt(token));
    },
    clearToken() {
      this.userToken = null;
      this.user = null;
      localStorage.removeItem(STORAGE_KEY);
    },
    // Two-header auth: X-API-Key identifies the *app*, Authorization Bearer
    // identifies the *user*. Both are required by the Laravel API middleware.
    async login(identifier, password) {
      // `identifier` is either an email or a phone number — send it as "identifier"
      // so the backend can decide, or normalize it here depending on your API.
      const { data } = await api.post("/auth/login", {
        identifier: identifier.trim(),
        password,
      });
      this.setToken(data.token);
      this.user = data.user;
      return data.user;
    },
    async logout() {
      try {
        await api.post("/auth/logout");
      } finally {
        this.clearToken();
      }
    },
    async fetchProfile() {
      const { data } = await api.get("/auth/me");
      this.user = data;
      return data;
    },

    // ---- Create account / recover password ----
    async register(payload) {
      const { data } = await api.post("/auth/register", payload);
      if (data.token) {
        this.setToken(data.token);
        this.user = data.user;
      }
      return data;
    },
    async forgotPassword(identifier) {
      return api.post("/auth/forgot-password", { identifier });
    },
    async resetPassword(payload) {
      return api.post("/auth/reset-password", payload);
    },
    // Social login: opens the provider's OAuth URL returned by the backend.
    async socialLogin(provider) {
      const { data } = await api.post(`/auth/social/${provider}`);
      if (data?.url) window.location.href = data.url;
      return data;
    },

    // ---- Profile ----
    async updateProfile(payload) {
      const { data } = await api.put("/auth/me", payload);
      this.user = data;
      return data;
    },
    async changePassword(currentPassword, newPassword) {
      return api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
    },

    // ---- 2FA ----
    async enable2FA(method) {
      const { data } = await api.post("/auth/2fa/enable", { method });
      return data;
    },
    async verify2FA(code) {
      const { data } = await api.post("/auth/2fa/verify", { code });
      this.user = data;
      return data;
    },
    async disable2FA(code) {
      const { data } = await api.post("/auth/2fa/disable", { code });
      this.user = data;
      return data;
    },

    // ---- Settings ----
    async updateNotifications(preferences) {
      const { data } = await api.put("/auth/notifications", { preferences });
      this.user = data;
      return data;
    },
    async updateAIAgent(config) {
      const { data } = await api.put("/auth/ai-agent", config);
      this.user = data;
      return data;
    },
    async updateTelegram(config) {
      const { data } = await api.put("/auth/telegram", config);
      this.user = data;
      return data;
    },
    async testTelegram() {
      return api.post("/auth/telegram/test");
    },
  },
});