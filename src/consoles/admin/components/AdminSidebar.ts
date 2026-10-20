import { Page, expect } from '@playwright/test';

/**
 * The Super Admin left sidebar.
 * ⚠ The drawer-toggle and link locators are best-guess — verify against the
 * real DOM (inspect the sidebar) and adjust like you did for the Shop sidebar.
 */
export class AdminSidebar {
  constructor(private readonly page: Page) {}

  /** Open the sidebar drawer if it's collapsed. No-op if already open. */
  private async ensureOpen(): Promise<void> {
    const closeBtn = this.page.getByRole('button', { name: 'Close for now' });
    if (await closeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await closeBtn.click().catch(() => {});
    }

    const toggle = this.page
      .getByRole('banner')
      .getByRole('button')
      .filter({ hasText: /^$/ })
      .first()
      .or(this.page.locator('button[aria-label*="menu" i], button[aria-label*="drawer" i], header button:has(svg)').first());

    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click().catch(() => {});
    }
  }

  /** Click a top-level sidebar item by its visible label. */
  async goTo(name: string): Promise<void> {
    await this.ensureOpen();
    const link = this.page
      .getByRole('link', { name: new RegExp(`^${name}$`, 'i') })
      .or(this.page.getByRole('button', { name: new RegExp(`^${name}$`, 'i') }))
      .first();
    await expect(link).toBeVisible({ timeout: 15_000 });
    await link.click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Expand a parent item (e.g. "Financials") then click a sub-item. */
  async goToSub(parent: string, child: string): Promise<void> {
    await this.ensureOpen();
    await this.page
      .getByText(new RegExp(`^${parent}$`, 'i'))
      .first()
      .click();
    const sub = this.page.getByText(new RegExp(`^${child}$`, 'i')).first();
    await expect(sub).toBeVisible({ timeout: 15_000 });
    await sub.click();
    await this.page.waitForLoadState('networkidle');
  }
}
