import { Page, expect } from '@playwright/test';

export class TabBar {
  constructor(private readonly page: Page) {}

  async select(name: string | RegExp): Promise<void> {
    // Anchor exact text so "Customer" doesn't also match "Customer Support".
    const exactName = typeof name === 'string'
      ? new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
      : name;

    const tab = this.page
      .getByRole('tab', { name: exactName })
      .or(this.page.getByRole('button', { name: exactName }))
      .or(this.page.getByText(exactName))
      .first();
    await tab.click();
    await this.page.waitForLoadState('networkidle');
  }
}