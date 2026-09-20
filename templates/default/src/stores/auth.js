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
    async login(email, password) {
      const { data } = await api.post("/auth/login", { email, password });
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
  },
});
