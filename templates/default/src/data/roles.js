// UserRole support. The scaffolder rewrites this file to keep only the roles
// you picked at scaffold time; an empty ROLES means UserRole support is off.
// `label` and `description` are vue-i18n keys (see i18n/locales/*.json).
export const ROLES = [
  {
    key: "master",
    label: "roles.master.title",
    badge: "bg-rose-500/10 text-rose-300 ring-rose-400/30",
  },
  {
    key: "super_admin",
    label: "roles.super_admin.title",
    badge: "bg-amber-500/10 text-amber-300 ring-amber-400/30",
  },
  {
    key: "admin",
    label: "roles.admin.title",
    badge: "bg-cyan-500/10 text-cyan-300 ring-cyan-400/30",
  },
  {
    key: "user",
    label: "roles.user.title",
    badge: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30",
  },
];