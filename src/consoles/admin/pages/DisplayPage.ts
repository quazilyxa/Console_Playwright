import { expect, type Locator } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';
import { TabBar } from '@/consoles/admin/components/TabBar';

export type BannerScreen =
  | 'Home' | 'Food' | 'Grocery' | 'Coffee' | 'Pets' | 'Flowers' | 'Beauty' | 'Wellness';

export interface BannerData {
  title: string;
  link: string;
  screen: BannerScreen;
}

/** Image used for the banner photo. Override with BANNER_PHOTO_PATH in .env. */
const PHOTO_PATH = process.env.BANNER_PHOTO_PATH ?? 'C:\\Users\\quazi\\Downloads\\abc.jpg';

/**
 * DisplayPage — Display › Ads Banner.
 *
 * Display opens directly on the Ads Banner page (heading "Banner"). Banners are
 * grouped by screen tab (Home, Food, ...). Flow: pick a screen tab, add a
 * banner, search, edit (change screen), toggle status, filter by status, delete.
 */
export class DisplayPage extends AdminBasePage {
  readonly path = AdminRoutes.display;
  protected readonly heading = AdminSelectors.headings.display;

  /** Screen tabs (Home/Food/...) — the horizontal tab bar on the Banner page. */
  private get screenTabs(): TabBar {
    return new TabBar(this.page);
  }

  /* ------------------------------------------------------------------ *
   * Navigation
   * ------------------------------------------------------------------ */

  /** Display opens on the Ads Banner page by default — just confirm it's loaded. */
  async openAdsBanner(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Banner' })).toBeVisible();
    await this.waitForList();
  }

  /** Selects a screen tab (Home, Food, ...). */
  async selectScreen(screen: BannerScreen): Promise<void> {
    await this.screenTabs.select(screen);
    await this.waitForList();
  }

  /* ------------------------------------------------------------------ *
   * Locators
   * ------------------------------------------------------------------ */

  /** Toolbar "Add" button (type=button); the form's submit is type=submit. */
  private get addButton(): Locator {
    return this.page.locator('button[type="button"]').filter({ hasText: /^Add$/ }).first();
  }

  private get searchInput(): Locator {
    return this.page.locator('input[name="searchValue"]');
  }

  /** The ⋮ kebab on the (single) search-result card. */
  private get kebab(): Locator {
    return this.page.locator('button:has(svg.iconify--heroicons-solid)').last();
  }

  /* ------------------------------------------------------------------ *
   * Test data
   * ------------------------------------------------------------------ */

  static randomBanner(overrides: Partial<BannerData> = {}): BannerData {
    const stamp = Date.now().toString().slice(-8);
    return {
      title: `AT-Banner-${stamp}`,
      link: 'https://www.example.com',
      screen: 'Home',
      ...overrides,
    };
  }

  /* ------------------------------------------------------------------ *
   * Create
   * ------------------------------------------------------------------ */

  async createBanner(overrides: Partial<BannerData> = {}): Promise<BannerData> {
    const data = DisplayPage.randomBanner(overrides);

    // Open the form (single click) and wait for the drawer, not the list.
    await expect(this.addButton).toBeVisible();
    await this.addButton.click();
    await expect(this.page.getByRole('heading', { name: 'Details' })).toBeVisible();

    await this.page.locator('input[name="title"]').fill(data.title);

    await this.selectMuiSelectByLabel('Clickable', 'Yes');
    await this.selectMuiSelectByLabel('Screen', data.screen);

    // Zones (autocomplete): pick the first option.
    await this.selectAutocompleteByPlaceholder('Select Zones');

    // Click Option: choose Link.
    await this.page.getByRole('radio', { name: 'Link', exact: true }).check();

    // Link Type -> URL (the hidden select input is name="linkType").
    await this.selectMuiSelectByInputName('linkType', 'URL');
    await this.page.locator('input[name="link"]').fill(data.link);

    // Schedule: start = today, end = today + 7 days.
     const start = new Date();
    start.setDate(start.getDate());   // one day ahead of today

    const end = new Date(start);
    end.setDate(start.getDate() + 7);     // 7 days after start

    await this.pickScheduleDate(0, start);
    await this.pickScheduleDate(1, end);

    await this.uploadImage(PHOTO_PATH);
    await this.page.waitForTimeout(6000);
    // Submit (distinct from the toolbar "Add" that opened the form).
    await this.page.locator('button[type="submit"]').filter({ hasText: /^Add$/ }).click();
    await this.waitForList();

    return data;
  }

  private async uploadImage(filePath: string): Promise<void> {
    // The dropzone's hidden input accepts images (and .json). Target it directly
    // and set files on it — no click needed; the input need not be visible.
    await this.page
      .locator('input[type="file"][accept*="image"]')
      .first()
      .setInputFiles(filePath);

    const uploadOriginal = this.page.getByRole('button', { name: /^finish$/i });  
    await expect(uploadOriginal).toBeVisible();
    await uploadOriginal.click();
    await expect(uploadOriginal).toBeHidden();

    // The confirm only crops — the upload POST runs after. Let it finish so
    // Submit doesn't fire before the photo registers.
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500);
  }

  /**
   * Opens the Schedule date picker at `index` (0 = Start, 1 = End) and selects
   * `target`. The two "Choose date" buttons are matched by document order.
   */
  private async pickScheduleDate(index: number, target: Date): Promise<void> {
    await this.page.getByRole('button', { name: /choose date/i }).nth(index).click();

    const calendar = this.page.getByRole('dialog').last();
    await expect(calendar).toBeVisible();

    const label = calendar.locator('.MuiPickersCalendarHeader-label');
    const targetLabel = target.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    for (let i = 0; i < 24; i++) {
      const current = (await label.textContent())?.trim() ?? '';
      if (current === targetLabel) break;
      const forward = new Date(`${current} 1`) < new Date(`${targetLabel} 1`);
      await calendar
        .getByRole('button', { name: forward ? 'Next month' : 'Previous month' })
        .click();
      await this.page.waitForTimeout(150);
    }

    await calendar
      .getByRole('gridcell', { name: String(target.getDate()), exact: true })
      .first()
      .click();

    await expect(calendar).toBeHidden();
  }

  /* ------------------------------------------------------------------ *
   * Search
   * ------------------------------------------------------------------ */

  async searchBanner(name: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.waitForList();
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  private async openKebab(): Promise<void> {
    await this.kebab.click();
    await expect(this.page.getByRole('menu')).toBeVisible();
  }

  /* ------------------------------------------------------------------ *
   * Update
   * ------------------------------------------------------------------ */

  /** Edits the banner and changes its Screen (e.g. Home -> Food). */
  async changeScreen(name: string, screen: BannerScreen): Promise<void> {
    await this.searchBanner(name);
    await this.openKebab();
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();

    await this.selectMuiSelectByLabel('Screen', screen);

    await this.page.getByRole('button', { name: 'Save Changes' }).click();
    await this.waitForList();
  }

  /** Clicks the row's Active/Inactive toggle switch (after a search). */
  async toggleStatus(): Promise<void> {
    await this.page.getByRole('switch').first().click();
    await this.waitForList();
  }

  /** Toolbar Status filter (Active / Inactive). */
  async filterByStatus(status: 'Active' | 'Inactive'): Promise<void> {
    await this.selectMuiSelectByLabel('Status', status);
    await this.waitForList();
  }

  /* ------------------------------------------------------------------ *
   * Delete
   * ------------------------------------------------------------------ */

  async deleteBanner(name: string): Promise<void> {
    await this.searchBanner(name);
    await this.openKebab();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();

    const confirmDialog = this.page.getByRole('dialog');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole('button', { name: /delete|confirm|yes/i }).click();
    await expect(confirmDialog).toBeHidden();
    await this.waitForList();

    await this.clearSearch();
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill('');
    await this.waitForList();
  }

  /* ------------------------------------------------------------------ *
   * Assertions
   * ------------------------------------------------------------------ */

  async expectBannerVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  async expectBannerGone(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
  }

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  /** MUI Select anchored to its label. Matches "Label" or "Label *" exactly. */
  private async selectMuiSelectByLabel(label: string, option?: string): Promise<void> {
    const combo = this.page.locator(
      `xpath=//label[normalize-space()="${label}" or normalize-space()="${label} *"]` +
        `/following::*[@role="combobox"][1]`,
    );
    await combo.click();
    await this.pickFromListbox(option);
  }

  /** MUI Select whose hidden value input has name=`inputName` (e.g. linkType). */
  private async selectMuiSelectByInputName(inputName: string, option?: string): Promise<void> {
    const combo = this.page.locator(
      `xpath=//input[@name="${inputName}"]/following::*[@role="combobox"][1]` +
        ` | //input[@name="${inputName}"]/../*[@role="combobox"]`,
    );
    await combo.first().click();
    await this.pickFromListbox(option);
  }

  /** MUI Autocomplete addressed by input placeholder. Omit `option` for random. */
  private async selectAutocompleteByPlaceholder(placeholder: string, option?: string): Promise<void> {
    await this.page.locator(`input[placeholder="${placeholder}"]`).click();
    await this.pickFromListbox(option);
  }

  private async pickFromListbox(option?: string): Promise<void> {
    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    if (option) {
      await listbox.getByRole('option', { name: option, exact: true }).click();
    } else {
      const options = listbox.getByRole('option');
      const count = await options.count();
      expect(count, 'listbox has no options to choose from').toBeGreaterThan(0);
      await options.nth(Math.floor(Math.random() * count)).click();
    }

    // Multi-select autocompletes (Zones) keep the popup open.
    if (await listbox.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape');
    }
    await expect(listbox).toBeHidden();
  }

  private async waitForList(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    await expect(this.page.getByRole('progressbar')).toHaveCount(0);
  }
}