import { Locator, expect } from '@playwright/test';
import { BasePage } from '@/core/BasePage';

/**
 * Base for Super Admin pages. Subclasses set `path` and `heading`.
 */
export abstract class AdminBasePage extends BasePage {
  /** Route path for this page (from AdminRoutes). */
  abstract readonly path: string;
  /** Heading text/regex used to confirm the page loaded. */
  protected abstract readonly heading: RegExp | string;

  /** Navigate directly to this page's route. */
  async goto(): Promise<void> {
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
  }

  protected headingLocator(): Locator {
    return this.page.getByRole('heading', { name: this.heading as any });
  }

  /** Confirm the page has loaded by waiting for its heading. */
  async expectLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.headingLocator().first()).toBeVisible({ timeout: 20_000 });
  }
}
