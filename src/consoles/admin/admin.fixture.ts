import { test as base, expect } from '@playwright/test';
import { AdminApp } from '@/consoles/admin/AdminApp';

type AdminFixtures = {
  admin: AdminApp;
  step: (name: string, body: () => Promise<void>) => Promise<void>;
};

export const test = base.extend<AdminFixtures>({
  admin: async ({ page }, use) => {
    await use(new AdminApp(page));
  },
  step: async ({}, use) => {
    const step = async (name: string, body: () => Promise<void>) => {
      await test.step(name, body);
    };
    await use(step);
  },
});

export { expect };