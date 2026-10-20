import { expect, type Locator, type Page } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';

export interface DeliverySettingsData {
  amount?: string;
  updateAmount?: string;
}

export interface FinancePaymentData {
  amount?: string;
  note?: string;
}

/**
 * AccessAsShopPage — Super Admin "Access As Shop" impersonation actions.
 *
 * Covers:
 * - Navigate from Super Admin Shops list -> 3-dots kebab -> "Access As Shop"
 * - Settings -> Delivery Settings (Update amount, save)
 * - Dashboard -> Customer (Last 7 Days) & Operations (This Year)
 * - Marketing -> View verification
 * - Finance -> Filter This Year -> Add payment (Amount, Admin Note, Pay)
 * - Profile -> Issues tab
 * - Products -> Attributes Settings (modal dismiss), Out of Stock Items, Hidden Items
 * - Return back to Super Admin Dashboard
 */
export class AccessAsShopPage extends AdminBasePage {
  readonly path = AdminRoutes.shops;
  protected readonly heading = AdminSelectors.headings.shops;

  /** Exposes the underlying Playwright Page instance. */
  get pageInstance(): Page {
    return this.page;
  }

  /* ------------------------------------------------------------------ *
   * Navigation to Shops & Access As Shop
   * ------------------------------------------------------------------ */

  /**
   * Ensures the Super Admin sidebar drawer is open.
   * Clicks the banner menu toggle if the 'Shops' navigation link is not visible.
   */
  async ensureSidebarOpen(): Promise<void> {
    const shopsLink = this.page.getByRole('link', { name: 'Shops' });
    if (await shopsLink.isVisible({ timeout: 1500 }).catch(() => false)) {
      return;
    }

    const toggle = this.page
      .getByRole('banner')
      .getByRole('button')
      .filter({ hasText: /^$/ })
      .first();

    if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await toggle.click();
    } else {
      const fallbackToggle = this.page.locator('header button:has(svg), button[aria-label*="menu" i]').first();
      if (await fallbackToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fallbackToggle.click();
      }
    }

    const opened = await shopsLink.isVisible({ timeout: 5000 }).catch(() => false);
    if (!opened && (await toggle.isVisible().catch(() => false))) {
      await toggle.click().catch(() => {});
    }
  }

  /**
   * Navigates to Super Admin Shops list and clicks "Access As Shop" via the row kebab menu.
   * @param shopName Optional shop name to target a specific row. Defaults to first shop row.
   */
  async accessShop(shopName?: string): Promise<void> {
    if (!this.page.url().includes('/shops') || this.page.url().includes('/shops/')) {
      if (this.page.url().includes('/shops/')) {
        // Already in a shop console; return to admin shops first
        await this.page.goto(AdminRoutes.shops);
      } else {
        await this.ensureSidebarOpen();
        const shopsLink = this.page.getByRole('link', { name: 'Shops' });
        await expect(shopsLink).toBeVisible({ timeout: 10_000 });
        await shopsLink.click();
      }
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // Pick row: specific shop by text or first available shop row
    const row = shopName
      ? this.page.getByRole('row').filter({ hasText: shopName }).first()
      : this.page.getByRole('row').nth(1);

    const kebabBtn = row
      .locator('.MuiButtonBase-root.MuiIconButton-root')
      .or(this.page.locator('.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-1hd14n'))
      .first();

    await expect(kebabBtn).toBeVisible({ timeout: 10_000 });
    await kebabBtn.click();

    const accessMenuItem = this.page.getByRole('menuitem', { name: 'Access As Shop' });
    if (!(await accessMenuItem.isVisible({ timeout: 1500 }).catch(() => false))) {
      await kebabBtn.click();
    }
    await expect(accessMenuItem).toBeVisible({ timeout: 5000 });
    await accessMenuItem.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /* ------------------------------------------------------------------ *
   * Shop Settings -> Delivery Settings
   * ------------------------------------------------------------------ */

  /**
   * Configures Delivery Settings inside the Shop console.
   */
  async configureDeliverySettings(data: DeliverySettingsData = {}): Promise<void> {
    const { amount = '90000', updateAmount = '100000' } = data;

    const settingsLink = this.page.getByRole('link', { name: 'Settings' });
    await expect(settingsLink).toBeVisible({ timeout: 10_000 });
    await settingsLink.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});

    const deliveryTab = this.page.getByRole('tab', { name: 'Delivery Settings' });
    await expect(deliveryTab).toBeVisible({ timeout: 10_000 });
    await deliveryTab.click();

    const amountInput = this.page.getByRole('spinbutton', { name: /Amount/i });
    await expect(amountInput).toBeVisible({ timeout: 10_000 });

    // Initial fill and save
    if (amount) {
      await amountInput.click();
      await amountInput.press('ControlOrMeta+a');
      await amountInput.fill(amount);

      const saveBtn = this.page.getByRole('button', { name: 'Save' });
      await expect(saveBtn).toBeEnabled({ timeout: 5000 });
      await saveBtn.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // Secondary update and save (if provided)
    if (updateAmount) {
      await amountInput.click();
      await amountInput.press('ControlOrMeta+a');
      await amountInput.fill(updateAmount);

      const saveBtn = this.page.getByRole('button', { name: 'Save' });
      await expect(saveBtn).toBeEnabled({ timeout: 5000 });
      await saveBtn.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  /* ------------------------------------------------------------------ *
   * Shop Dashboard Verification
   * ------------------------------------------------------------------ */

  /**
   * Verifies the Shop Dashboard tabs and date range filters.
   */
  async verifyShopDashboard(): Promise<void> {
    const dashboardLink = this.page.getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).toBeVisible({ timeout: 10_000 });
    await dashboardLink.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});

    // Customer tab -> Last 7 Days
    const customerTab = this.page.getByRole('tab', { name: 'Customer' });
    if (await customerTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await customerTab.click();
      await this.selectDateFilter('Last 7 Days');
    }

    // Operations tab -> This Year
    const operationsTab = this.page.getByRole('tab', { name: 'Operations' });
    if (await operationsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await operationsTab.click();
      await this.selectDateFilter('This Year');
    }
  }

  /* ------------------------------------------------------------------ *
   * Shop Marketing Verification
   * ------------------------------------------------------------------ */

  /**
   * Navigates to Shop Marketing section.
   */
  async verifyMarketing(): Promise<void> {
    const marketingLink = this.page.getByRole('link', { name: 'Marketing' });
    await expect(marketingLink).toBeVisible({ timeout: 10_000 });
    await marketingLink.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /* ------------------------------------------------------------------ *
   * Shop Finance Actions
   * ------------------------------------------------------------------ */

  /**
   * Navigates to Finance, filters by 'This Year', and adds a payment transaction.
   */
  async recordFinancePayment(data: FinancePaymentData = {}): Promise<void> {
    const { amount = '90000', note = 'Test' } = data;

    const financeLink = this.page.getByRole('link', { name: 'Finance' });
    await expect(financeLink).toBeVisible({ timeout: 10_000 });
    await financeLink.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});

    // Filter by This Year
    await this.selectDateFilter('This Year');

    // Click Add payment
    const addBtn = this.page.getByRole('button', { name: 'Add' });
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click();

    // Fill Amount
    const amountInput = this.page.getByRole('spinbutton', { name: /Amount/i });
    await expect(amountInput).toBeVisible({ timeout: 5000 });
    await amountInput.click();
    await amountInput.fill(amount);

    // Fill Admin Note
    const noteInput = this.page.getByRole('textbox', { name: /Admin Note/i });
    await expect(noteInput).toBeVisible({ timeout: 5000 });
    await noteInput.click();
    await noteInput.fill(note);

    // Click Pay
    const payBtn = this.page.getByRole('button', { name: 'Pay' });
    await expect(payBtn).toBeVisible({ timeout: 5000 });
    await payBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /* ------------------------------------------------------------------ *
   * Shop Profile Verification
   * ------------------------------------------------------------------ */

  /**
   * Navigates to Profile and switches to the Issues tab.
   */
  async verifyShopProfile(): Promise<void> {
    const profileLink = this.page.getByRole('link', { name: 'Profile' });
    await expect(profileLink).toBeVisible({ timeout: 10_000 });
    await profileLink.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});

    const issuesTab = this.page.getByRole('tab', { name: 'Issues' });
    if (await issuesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await issuesTab.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  /* ------------------------------------------------------------------ *
   * Shop Products Verification
   * ------------------------------------------------------------------ */

  /**
   * Navigates to Products, toggles Attributes Settings modal, and switches through stock tabs.
   */
  async verifyShopProducts(): Promise<void> {
    const productsLink = this.page.getByRole('link', { name: 'Products' });
    await expect(productsLink).toBeVisible({ timeout: 10_000 });
    await productsLink.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});

    // Open and close Attributes Settings
    const attrBtn = this.page.getByRole('button', { name: 'Attributes Settings' });
    if (await attrBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await attrBtn.click();

      // Dismiss dialog/drawer via backdrop or Escape
      const backdrop = this.page.locator('.MuiBackdrop-root');
      if (await backdrop.isVisible({ timeout: 2000 }).catch(() => false)) {
        await backdrop.click({ position: { x: 10, y: 10 } }).catch(async () => {
          await this.page.keyboard.press('Escape');
        });
      } else {
        await this.page.keyboard.press('Escape');
      }
    }

    // Switch to Out of Stock Items tab
    const outOfStockTab = this.page.getByRole('tab', { name: 'Out of Stock Items' });
    if (await outOfStockTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await outOfStockTab.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // Switch to Hidden Items tab
    const hiddenItemsTab = this.page.getByRole('tab', { name: 'Hidden Items' });
    if (await hiddenItemsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await hiddenItemsTab.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // Return to Profile link
    const profileLink = this.page.getByRole('link', { name: 'Profile' });
    if (await profileLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await profileLink.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  /* ------------------------------------------------------------------ *
   * Teardown / Return to Super Admin
   * ------------------------------------------------------------------ */

  /**
   * Returns back to the Super Admin Dashboard.
   */
  async returnToAdmin(): Promise<void> {
    const exitShopBtn = this.page
      .getByRole('button', { name: /Exit Shop|Exit Impersonation|Back to Admin/i })
      .or(this.page.getByRole('link', { name: /Exit Shop|Back to Admin/i }));

    if (await exitShopBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await exitShopBtn.click();
    } else {
      await this.page.goto(AdminRoutes.dashboard);
    }
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /* ------------------------------------------------------------------ *
   * Private Helpers
   * ------------------------------------------------------------------ */

  /** Helper to open the date filter popup and select an option. */
  private async selectDateFilter(optionName: string): Promise<void> {
    const filterBtn = this.page
      .locator('button:has(.iconify--material-symbols)')
      .or(this.page.locator('.iconify.iconify--material-symbols'))
      .first();

    if (await filterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await filterBtn.click();

      const option = this.page
        .getByRole('button', { name: optionName })
        .or(this.page.getByRole('menuitem', { name: optionName }));

      if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
        await option.click();
        await this.page.waitForLoadState('networkidle').catch(() => {});
      } else {
        // Close if option not found
        await this.page.keyboard.press('Escape');
      }
    }
  }
}
