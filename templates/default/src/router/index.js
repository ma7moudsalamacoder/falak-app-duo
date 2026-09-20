import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  { path: "/", name: "home", component: () => import("@/views/Home.vue") },

  // Public auth flows
  { path: "/login", name: "login", component: () => import("@/views/Login.vue") },
  { path: "/register", name: "register", component: () => import("@/views/Register.vue") },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("@/views/ForgotPassword.vue"),
  },

  // Authenticated sections
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/Profile.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("@/views/SettingsView.vue"),
    meta: { requiresAuth: true },
  },

  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.userToken) {
    return { name: "login" };
  }
});

export default router;