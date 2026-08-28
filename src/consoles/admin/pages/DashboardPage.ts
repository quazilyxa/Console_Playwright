import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';
import { TabBar } from '@/consoles/admin/components/TabBar';
import { expect } from '@playwright/test';

/**
 * DashboardPage — Super Admin "dashboard" section.
 *
 * Tabs: General, Marketing, Operations, Customer Support, Financials,
 *       Customer, Statistics, Orders.
 */
export class DashboardPage extends AdminBasePage {
  readonly path = AdminRoutes.dashboard;
  protected readonly heading = AdminSelectors.headings.dashboard;

  private readonly tabs = new TabBar(this.page);

  /** Switch to a tab on this page by name. */
  async openTab(name: string): Promise<void> {
    await this.tabs.select(name);
  }

  /**
   * Customer tab flow:
   *   open the date filter → pick "Current Month" → wait for load →
   *   scroll to the Zone autocomplete → type "Dhaka" → pick "Dhaka New" →
   *   wait 3s → scroll back up.
   */
  async customerTabFlow(): Promise<void> {
    // 1) Open the date filter (the calendar-icon adornment).
    await this.page
      .locator('.MuiInputAdornment-root', {
        has: this.page.locator('svg.iconify--material-symbols'),
      })
      .first()
      .click();

    // 2) Pick the "Current Month" chip.
    await this.page.getByText('Current Month', { exact: true }).click();

    // Let the filtered data load.
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // 3) Scroll to the Zone autocomplete and select "Dhaka New".
    const zoneInput = this.page.locator('#input-autocomplete-zoneIds');
    await zoneInput.scrollIntoViewIfNeeded();
    await zoneInput.click();
    await zoneInput.fill('Dhaka');

    const option = this.page
      .getByRole('option', { name: /dhaka new/i })
      .or(this.page.locator('li[role="option"]', { hasText: /dhaka new/i }));
    await expect(option.first()).toBeVisible();
    await option.first().click();
    await this.page.keyboard.press('Escape');
    await this.page.mouse.wheel(0, 1000);
    await this.page.waitForTimeout(2000);

    // 4) Stay 3s, then scroll back up.
    await this.page.waitForTimeout(3000);
    await this.page.mouse.wheel(0, -2000);
    await this.page.waitForTimeout(2000);
  }
}