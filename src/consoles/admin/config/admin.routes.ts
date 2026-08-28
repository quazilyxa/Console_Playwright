/**
 * Route paths for the Super Admin panel.
 * ⚠ These are best-guess paths — verify against the real URLs and adjust.
 */
export const AdminRoutes = {
  signIn: '/admin/sign-in',
  dashboard: '/admin',
  orders: '/admin/orders',
  parents: '/admin/parents',
  shops: '/admin/shops',
  users: '/admin/users',
  riders: '/admin/riders',
  financials: '/admin/financials',
  team: '/admin/team',
  display: '/admin/display',
  settings: '/admin/settings',
  chat: '/admin/chat',
  marketing: '/admin/marketing',
} as const;

export type AdminRouteKey = keyof typeof AdminRoutes;
