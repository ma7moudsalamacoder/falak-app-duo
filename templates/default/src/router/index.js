import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  { path: "/", name: "home", component: () => import("@/views/Home.vue") },
  { path: "/login", name: "login", component: () => import("@/views/Login.vue") },
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
