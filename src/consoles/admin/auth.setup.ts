// import { test as setup, expect } from '@playwright/test';
// import { ENV } from '@/config/env';
// import { AdminRoutes } from '@/consoles/admin/config/admin.routes';

// const authFile = '.auth/admin.json';

// setup('authenticate admin', async ({ page }) => {
//   await page.goto(`${ENV.admin.baseURL}${AdminRoutes.signIn}`, {
//     waitUntil: 'domcontentloaded',
//   });

//   // MUI TextFields, targeted by their visible labels.
//   await page.getByLabel('Email address').fill(ENV.admin.email);
//   await page.getByLabel('Password', { exact: true }).fill(ENV.admin.password);

//   await page.getByRole('button', { name: /sign ?in|log ?in/i }).click();

//   // Confirm login landed past the sign-in page.
//   await expect(page).not.toHaveURL(/sign-in/, { timeout: 20_000 });

//   await page.context().storageState({ path: authFile });
// });
import { test as setup, expect } from '@playwright/test';
import { ENV } from '@/config/env';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';

const authFile = '.auth/admin.json';

setup('authenticate admin', async ({ page }) => {
  console.log('1. Opening login page...');

  await page.goto(`${ENV.admin.baseURL}${AdminRoutes.signIn}`, {
    waitUntil: 'domcontentloaded',
  });

  console.log('2. Login page loaded:', page.url());

  console.log('3. Filling email...');
  await page.getByLabel('Email address').fill(ENV.admin.email);

  console.log('4. Filling password...');
  await page.getByLabel('Password', { exact: true }).fill(ENV.admin.password);

  console.log('5. Clicking Sign In...');
  await page.getByRole('button', { name: /sign ?in|log ?in/i }).click();

  console.log('6. Sign In clicked. Current URL:', page.url());

  await expect(page).not.toHaveURL(/sign-in/, {
    timeout: 20_000,
  });

  console.log('7. Login successful:', page.url());

  await page.context().storageState({ path: authFile });

  console.log('8. Auth state saved.');
});