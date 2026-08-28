import { Page, expect } from '@playwright/test';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';

/**
 * Super Admin sign-in page.
 * ⚠ Field selectors are best-guess — replace with the real ones once you
 * inspect the sign-in form (email / password / submit).
 */
export class AdminLoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(AdminRoutes.signIn, { waitUntil: 'domcontentloaded' });
  }

  async login(email: string, password: string): Promise<void> {
    await this.page
      .locator('input[type="email"]')
      .or(this.page.getByPlaceholder(/email/i))
      .first()
      .fill(email);
    await this.page.locator('input[type="password"]').first().fill(password);
    await this.page.getByRole('button', { name: /sign ?in|log ?in/i }).click();
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL(/sign-in/, { timeout: 20_000 });
  }
}
