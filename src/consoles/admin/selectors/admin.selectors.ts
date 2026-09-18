/**
 * Centralized selectors / labels for the Super Admin panel.
 * ⚠ Headings and tab labels are best-guess — verify against the real pages.
 */
export const AdminSelectors = {
  headings: {
    dashboard: /super admin/i,
    orders: /orders/i,
    parents: /parents/i,
    shops: /shops/i,
    users: /users/i,
    riders: /riders/i,
    financials: /financials/i,
    team: /team/i,
    display: /display/i,
    settings: /settings/i,
    chat: /chat/i,
    marketing: /marketing/i,
    tags: /Tags/i,
    vendors: /Vendors/i,
  },

  // Dashboard top tabs (from the screenshot).
tabs: {
  dashboard: ['General', 'Marketing', 'Operations', 'Customer Support', 'Financials', 'Customer', 'Statistics', 'Orders'],
},
  // Financials sidebar sub-items.
  financialsSubItems: ['Lyxa Financials', 'Parent Financials', 'Riders Financials'],

  searchPlaceholder: 'Search...',
} as const;
