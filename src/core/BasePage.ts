import { Page, Locator, expect } from '@playwright/test';

/**
 * Generic base for all page objects: holds the Page and common helpers.
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Pause for `ms` milliseconds (manual wait helper). */
  async settle(ms = 2000): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /** Clear a number/text field, then fill it cleanly (avoids "02"). */
  protected async setNumber(input: Locator, value: number | string): Promise<void> {
    await input.click();
    await input.press('ControlOrMeta+A');
    await input.press('Delete');
    await input.fill(String(value));
    await expect(input).toHaveValue(String(value));
  }
}
