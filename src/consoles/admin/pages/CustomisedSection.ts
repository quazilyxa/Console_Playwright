import { expect, type Locator, type Page } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';

const log = (scope: string, msg: string, data?: unknown) =>
  console.log(`[CustomisedSection.${scope}] ${msg}`, data ?? '');

export interface CustomizedShopsSectionData {
  sectionName?: string;
  screenSection?: string;
  zone?: string;
  zoneSearch?: string;
  tag?: string;
  tagSearch?: string;
  shopName?: string;
}

export interface CustomizedItemsSectionData {
  sectionName?: string;
  screenSection?: string;
  zone?: string;
  zoneSearch?: string;
  shop?: string;
  shopSearch?: string;
  category?: string;
}

/**
 * CustomisedSection page object for Super Admin: Display → User App Sections.
 * Supports creating, searching, and deleting:
 * 1. "Customized shops" sections
 * 2. "Customized items" sections
 */
export class CustomisedSection extends AdminBasePage {
  readonly path = AdminRoutes.display;
  protected readonly heading = /User App Sections|Display/i;

  constructor(page: Page) {
    super(page);
  }

  /* ------------------------------------------------------------------ *
   * Locators
   * ------------------------------------------------------------------ */

  /** Top toolbar "Add" button to open the drawer/form. */
  private get addButton(): Locator {
    return this.page
      .locator('button[type="button"]')
      .filter({ hasText: /^Add$/ })
      .first()
      .or(this.page.getByRole('button', { name: 'Add', exact: true }).first());
  }

  /** Drawer form submit "Add" button. */
  private get submitButton(): Locator {
    return this.page
      .locator('button[type="submit"]')
      .filter({ hasText: /^Add$/ })
      .or(this.page.getByRole('button', { name: 'Add', exact: true }).last());
  }

  /** Section name input field. */
  private get sectionNameInput(): Locator {
    return this.page
      .getByRole('textbox', { name: 'Section Name *' })
      .or(this.page.locator('input[name="name"]'))
      .first();
  }

  /** Screen Section dropdown. */
  private get screenSectionSelect(): Locator {
    return this.page.getByRole('combobox', { name: 'Screen Section' }).first();
  }

  /** Select Zones autocomplete combobox. */
  private get zonesSelect(): Locator {
    return this.page.getByRole('combobox', { name: 'Select Zones' }).first();
  }

  /** Select Tags autocomplete combobox. */
  private get tagsSelect(): Locator {
    return this.page.getByRole('combobox', { name: 'Select Tags' }).first();
  }

  /** Search shops autocomplete combobox. */
  private get searchShopsSelect(): Locator {
    return this.page.getByRole('combobox', { name: 'Search shops' }).first();
  }

  /** Category combobox. */
  private get categorySelect(): Locator {
    return this.page.getByRole('combobox', { name: 'Category' }).first();
  }

  /** Search textbox in toolbar. */
  private get searchInput(): Locator {
    return this.page
      .getByRole('textbox', { name: 'Search...' })
      .or(this.page.locator('input[name="searchValue"]'))
      .or(this.page.locator('input[placeholder*="Search"]'))
      .first();
  }

  /* ------------------------------------------------------------------ *
   * Navigation
   * ------------------------------------------------------------------ */

  /** Navigate to Display → User App Sections tab. */
  async gotoUserAppSections(): Promise<void> {
    const scope = 'gotoUserAppSections';
    log(scope, 'START');

    const tab = this.page
      .getByRole('tab', { name: 'User App Sections' })
      .or(this.page.getByText('User App Sections', { exact: true }))
      .first();

    const isTabVisible = await tab.isVisible({ timeout: 3000 }).catch(() => false);
    if (!isTabVisible) {
      log(scope, 'User App Sections tab not visible yet, navigating to Display...');
      const displayLink = this.page.getByRole('link', { name: 'Display' }).first();
      if (await displayLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await displayLink.click();
      } else {
        await this.goto();
      }
    }

    log(scope, 'Waiting for "User App Sections" tab...');
    await expect(tab).toBeVisible({ timeout: 15_000 });
    await tab.click();

    await this.waitForList();
    log(scope, 'DONE');
  }

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  private async closeDropdownIfOpen(combobox: Locator): Promise<void> {
    const isExpanded = await combobox.getAttribute('aria-expanded').catch(() => null);
    if (isExpanded === 'true') {
      await combobox.click().catch(() => {});
    }
  }

  private async waitForList(): Promise<void> {
    const scope = 'waitForList';
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);
    await expect(this.page.getByRole('progressbar')).toHaveCount(0, { timeout: 10_000 }).catch(() => {});
  }

  /* ------------------------------------------------------------------ *
   * Create: Customized Shops Section
   * ------------------------------------------------------------------ */

  async createCustomizedShopsSection(
    overrides: Partial<CustomizedShopsSectionData> = {}
  ): Promise<Required<CustomizedShopsSectionData>> {
    const scope = 'createCustomizedShopsSection';
    log(scope, 'START');

    const data: Required<CustomizedShopsSectionData> = {
      sectionName: overrides.sectionName ?? 'Item Section 101',
      screenSection: overrides.screenSection ?? 'Customized shops',
      zone: overrides.zone ?? 'Dhaka New',
      zoneSearch: overrides.zoneSearch ?? 'Dhaka',
      tag: overrides.tag ?? 'Coffee',
      tagSearch: overrides.tagSearch ?? 'Coffee',
      shopName: overrides.shopName ?? 'Coffee Prince Coffee Prince',
    };

    log(scope, 'Opening Add drawer...', data);
    await expect(this.addButton).toBeVisible({ timeout: 15_000 });
    await this.addButton.click();

    // Fill Section Name
    await expect(this.sectionNameInput).toBeVisible({ timeout: 15_000 });
    await this.sectionNameInput.click();
    await this.sectionNameInput.fill(data.sectionName);

    // Select Screen Section -> 'Customized shops'
    log(scope, `Selecting Screen Section "${data.screenSection}"...`);
    await this.screenSectionSelect.click();
    const sectionOption = this.page.getByRole('option', { name: data.screenSection });
    await expect(sectionOption).toBeVisible({ timeout: 10_000 });
    await sectionOption.click();

    // Select Zones -> e.g. type 'Dhaka' -> select option 'Dhaka New'
    log(scope, `Selecting Zone "${data.zone}" (search: "${data.zoneSearch}")...`);
    await this.zonesSelect.click();
    await this.zonesSelect.fill(data.zoneSearch);
    const zoneOption = this.page.getByRole('option', { name: data.zone }).first();
    await expect(zoneOption).toBeVisible({ timeout: 10_000 });
    await zoneOption.click();
    await this.closeDropdownIfOpen(this.zonesSelect);

    // Select Tags -> e.g. type 'Coffee' -> select option 'Coffee'
    log(scope, `Selecting Tag "${data.tag}" (search: "${data.tagSearch}")...`);
    await this.tagsSelect.click();
    await this.tagsSelect.fill(data.tagSearch);
    const tagOption = this.page.getByRole('option', { name: data.tag }).first();
    await expect(tagOption).toBeVisible({ timeout: 10_000 });
    await tagOption.click();
    await this.closeDropdownIfOpen(this.tagsSelect);

    // Select Shop Checkbox
    log(scope, `Checking shop "${data.shopName}"...`);
    const shopCheckbox = this.page
      .getByRole('checkbox', { name: data.shopName })
      .first()
      .or(this.page.getByRole('checkbox').first());
    await expect(shopCheckbox).toBeVisible({ timeout: 10_000 });
    await shopCheckbox.check();

    // Submit form
    log(scope, 'Submitting Add form...');
    await expect(this.submitButton).toBeVisible({ timeout: 10_000 });
    await this.submitButton.click();

    await this.waitForList();
    log(scope, 'DONE', data);
    return data;
  }

  /* ------------------------------------------------------------------ *
   * Create: Customized Items Section
   * ------------------------------------------------------------------ */

  async createCustomizedItemsSection(
    overrides: Partial<CustomizedItemsSectionData> = {}
  ): Promise<Required<CustomizedItemsSectionData>> {
    const scope = 'createCustomizedItemsSection';
    log(scope, 'START');

    const data: Required<CustomizedItemsSectionData> = {
      sectionName: overrides.sectionName ?? 'Item 101',
      screenSection: overrides.screenSection ?? 'Customized items',
      zone: overrides.zone ?? 'Dhaka New',
      zoneSearch: overrides.zoneSearch ?? 'Dhaka',
      shop: overrides.shop ?? 'Test Shop',
      shopSearch: overrides.shopSearch ?? 'Test Shop',
      category: overrides.category ?? 'Premium',
    };

    log(scope, 'Opening Add drawer...', data);
    await expect(this.addButton).toBeVisible({ timeout: 15_000 });
    await this.addButton.click();

    // Fill Section Name
    await expect(this.sectionNameInput).toBeVisible({ timeout: 15_000 });
    await this.sectionNameInput.click();
    await this.sectionNameInput.fill(data.sectionName);

    // Select Screen Section -> 'Customized items'
    log(scope, `Selecting Screen Section "${data.screenSection}"...`);
    await this.screenSectionSelect.click();
    const sectionOption = this.page.getByRole('option', { name: data.screenSection });
    await expect(sectionOption).toBeVisible({ timeout: 10_000 });
    await sectionOption.click();

    // Select Zones -> e.g. type 'Dhaka' -> select option 'Dhaka New'
    log(scope, `Selecting Zone "${data.zone}" (search: "${data.zoneSearch}")...`);
    await this.zonesSelect.click();
    await this.zonesSelect.fill(data.zoneSearch);
    const zoneOption = this.page.getByRole('option', { name: data.zone }).first();
    await expect(zoneOption).toBeVisible({ timeout: 10_000 });
    await zoneOption.click();
    await this.closeDropdownIfOpen(this.zonesSelect);

    // Search shops -> e.g. type 'Test Shop' -> select option 'Test Shop' (exact: true)
    log(scope, `Selecting Shop "${data.shop}" (search: "${data.shopSearch}")...`);
    await this.searchShopsSelect.click();
    await this.searchShopsSelect.fill(data.shopSearch);
    const shopOption = this.page.getByRole('option', { name: data.shop, exact: true }).first();
    await expect(shopOption).toBeVisible({ timeout: 10_000 });
    await shopOption.click();
    await this.closeDropdownIfOpen(this.searchShopsSelect);

    // Select Category -> e.g. 'Premium'
    log(scope, `Selecting Category "${data.category}"...`);
    await this.categorySelect.click();
    const categoryOption = this.page.getByRole('option', { name: data.category }).first();
    await expect(categoryOption).toBeVisible({ timeout: 10_000 });
    await categoryOption.click();

    // Submit form
    log(scope, 'Submitting Add form...');
    await expect(this.submitButton).toBeVisible({ timeout: 10_000 });
    await this.submitButton.click();

    await this.waitForList();
    log(scope, 'DONE', data);
    return data;
  }

  /* ------------------------------------------------------------------ *
   * Search
   * ------------------------------------------------------------------ */

  async searchSection(name: string): Promise<void> {
    const scope = 'searchSection';
    log(scope, `Searching for "${name}"...`);

    await expect(this.searchInput).toBeVisible({ timeout: 10_000 });
    await this.searchInput.click();
    await this.searchInput.press('ControlOrMeta+a');
    await this.searchInput.fill(name);
    await this.searchInput.press('Enter').catch(() => {});

    await this.waitForList();
    log(scope, 'DONE');
  }

  async clearSearch(): Promise<void> {
    const scope = 'clearSearch';
    log(scope, 'Clearing search input...');

    await expect(this.searchInput).toBeVisible({ timeout: 10_000 });
    await this.searchInput.click();
    await this.searchInput.press('ControlOrMeta+a');
    await this.searchInput.fill('');
    await this.searchInput.press('Enter').catch(() => {});

    await this.waitForList();
    log(scope, 'DONE');
  }

  /* ------------------------------------------------------------------ *
   * Delete
   * ------------------------------------------------------------------ */

  async deleteSection(name: string): Promise<void> {
    const scope = 'deleteSection';
    log(scope, `Deleting section "${name}"...`);

    // Locate the row action/kebab button
    const row = this.page.locator('tr').filter({ hasText: name }).first();
    let actionBtn: Locator;

    if (await row.isVisible({ timeout: 3000 }).catch(() => false)) {
      actionBtn = row.getByRole('button').last();
    } else {
      actionBtn = this.page
        .getByRole('cell', { name: 'Active' })
        .getByRole('button')
        .first()
        .or(this.page.locator('button:has(svg.iconify--heroicons-solid)').last());
    }

    await expect(actionBtn).toBeVisible({ timeout: 10_000 });
    await actionBtn.click();

    // Click 'Delete' menu item
    const deleteMenuItem = this.page.getByRole('menuitem', { name: 'Delete' });
    await expect(deleteMenuItem).toBeVisible({ timeout: 10_000 });
    await deleteMenuItem.click();

    // Confirm deletion in modal
    const confirmDeleteBtn = this.page.getByRole('button', { name: 'Delete' }).last();
    await expect(confirmDeleteBtn).toBeVisible({ timeout: 10_000 });
    await confirmDeleteBtn.click();

    await this.waitForList();
    log(scope, `Deleted section "${name}" successfully`);
  }

  async expectSectionGone(name: string): Promise<void> {
    await expect(this.page.getByRole('cell', { name, exact: true })).toHaveCount(0, { timeout: 10_000 });
  }

  /* ------------------------------------------------------------------ *
   * Full Automation Runner
   * ------------------------------------------------------------------ */

  /**
   * Executes the complete user flow recorded:
   * 1. Add "Customized shops" section ('Item Section 101'), search, and delete it.
   * 2. Add "Customized items" section ('Item 101'), search, and delete it.
   */
  async runFullAutomation(): Promise<void> {
    const scope = 'runFullAutomation';
    log(scope, 'START');

    // 1. Customized shops
    await this.createCustomizedShopsSection();
    await this.searchSection('Item Section 101');
    await this.deleteSection('Item Section 101');

    // 2. Customized items
    await this.createCustomizedItemsSection();
    await this.searchSection('Item 101');
    await this.deleteSection('Item 101');
    await this.clearSearch();

    log(scope, 'DONE');
  }
}

export { CustomisedSection as CustomisedSectionPage };
