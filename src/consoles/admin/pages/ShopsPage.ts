import { expect, type Locator } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';
import { TabBar } from '@/consoles/admin/components/TabBar';

export interface ShopData {
  shopName: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  userPhone: string;
  minOrderAmount: number;
}

/** Image used for both profile photo and banner uploads. Override with
 *  SHOP_PHOTO_PATH in .env when running on another machine. */
const PHOTO_PATH = process.env.SHOP_PHOTO_PATH ?? 'C:\\Users\\quazi\\Downloads\\abc.jpg';

/**
 * ShopsPage — Super Admin "shops" section.
 *
 * Create is a 4-step wizard (Details → Contact → Hours+Media → Create).
 * Also covers: search, edit (status -> Inactive), status filter, delete.
 */
export class ShopsPage extends AdminBasePage {
  readonly path = AdminRoutes.shops;
  protected readonly heading = AdminSelectors.headings.shops;

  private readonly tabs = new TabBar(this.page);

  /* ------------------------------------------------------------------ *
   * Locators
   * ------------------------------------------------------------------ */

  private get addShopButton(): Locator {
    return this.page.getByRole('button', { name: 'Add Shop' });
  }

  private get searchInput(): Locator {
    return this.page.locator('input[name="searchValue"]');
  }

  /** Kebab (⋮) menu in the shop detail header. */
  private get actionsButton(): Locator {
    return this.page.locator('button:has(svg.iconify--heroicons-solid)').last();
  }

  /** Status combobox inside the Edit drawer (accessible name reflects current value). */
  private get formStatusInput(): Locator {
    return this.page.getByRole('combobox', { name: /^(Active|Inactive)$/ });
  }

  /** Status combobox in the list toolbar (has placeholder="Status"). */
  private get filterStatusInput(): Locator {
    return this.page.locator('#input-autocomplete-status[placeholder="Status"]');
  }

  private get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'Next', exact: true });
  }

  /* ------------------------------------------------------------------ *
   * Tabs
   * ------------------------------------------------------------------ */

  async openTab(name: string): Promise<void> {
    await this.tabs.select(name);
  }

  /* ------------------------------------------------------------------ *
   * Test data
   * ------------------------------------------------------------------ */

  static randomShop(overrides: Partial<ShopData> = {}): ShopData {
    const stamp = Date.now().toString().slice(-8);
    const phone = () => String(1_000_000 + Math.floor(Math.random() * 9_000_000));
    return {
      shopName: `AT-Shop-${stamp}`,
      ownerName: `AT Owner ${stamp}`,
      email: `at.shop.${stamp}@mailinator.com`,
      password: 'Dhaka@01',
      phone: phone(),
      userPhone: phone(),
      minOrderAmount: 90000,
      ...overrides,
    };
  }

  /** Type dropdown is limited to Food or Grocery. */
  static randomType(): 'Food' | 'Grocery' {
    return Math.random() < 0.5 ? 'Food' : 'Grocery';
  }

  private randomType(): 'Food' | 'Grocery' {
    return ShopsPage.randomType();
  }

  /* ------------------------------------------------------------------ *
   * Create — 4-step wizard
   * ------------------------------------------------------------------ */

  async createShop(overrides: Partial<ShopData> = {}): Promise<ShopData> {
    const data = ShopsPage.randomShop(overrides);

    await this.addShopButton.click();
    await expect(this.page.getByRole('heading', { name: 'Add Shop' })).toBeVisible();

    await this.fillDetailsStep(data);
    await this.nextButton.click();

    await this.fillContactStep(data);
    await this.nextButton.click();

    await this.fillHoursStep();
    await this.nextButton.click();

    await this.fillMediaStep();

    // Give the banner/profile uploads a beat to register before submitting;
    // clicking Create too fast can trip the "Banner is required" validation.
    await this.page.waitForTimeout(1000);

    await this.page.getByRole('button', { name: 'Create', exact: true }).click();
    await this.waitForList();

    return data;
  }

  /** Step 1: names, credentials, address, zone/type/parent/brand/tags, price, min order. */
  private async fillDetailsStep(data: ShopData): Promise<void> {
    await this.page.locator('input[placeholder="Shop Name"]').fill(data.shopName);
    await this.page.locator('input[placeholder="Owner Name"]').fill(data.ownerName);
    await this.page.locator('input[placeholder="example@gmail.com"]').fill(data.email);
    await this.page.locator('input[name="password"]').fill(data.password);
    await this.page.locator('input[name="confirmPassword"]').fill(data.password);

    await this.pickAddressFromMap();

    await this.page
      .locator('input[placeholder="Address Description"]')
      .fill('Test Address Description');

    // Comboboxes are MUI Autocompletes addressed by accessible name.
    await this.selectZone();
    await this.selectComboByRole('Food', this.randomType()); // Type: Food or Grocery
    await this.selectComboByRole('Select Parent');
    await this.selectComboByRole('Select Brand');
    await this.selectComboByRole('Select Tags');

    await this.pickRandomPriceRange();

    await this.page.getByRole('checkbox', { name: 'Visibility On App' }).check();

    await this.page.getByRole('spinbutton', { name: 'Amount' }).fill(String(data.minOrderAmount));
  }

  /** Step 2: shop phone + user phone. */
  private async fillContactStep(data: ShopData): Promise<void> {
    await this.page.locator('input[name="phoneNumber"]').fill(data.phone);
    await this.page.locator('input[name="userPhoneNumber"]').fill(data.userPhone);
  }

  /** Step 3: enable a couple of days as 24H. */
  private async fillHoursStep(): Promise<void> {
    for (const day of ['Sunday', 'Monday']) {
      await this.enableDay24H(day);
    }
  }

  /** Step 4: profile photo + banner uploads, each confirmed via Upload Original. */
  private async fillMediaStep(): Promise<void> {
    await this.uploadImage('Profile Photo', PHOTO_PATH);
    await this.uploadImage('Banner', PHOTO_PATH);
  }

  /* ------------------------------------------------------------------ *
   * Create helpers
   * ------------------------------------------------------------------ */

  private async pickAddressFromMap(): Promise<void> {
    await this.page.getByRole('button', { name: 'directions' }).click();

    const saveButton = this.page.getByRole('button', { name: 'Save', exact: true });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await expect(saveButton).toBeHidden();
  }

  private async pickRandomPriceRange(): Promise<void> {
    const options = this.page.getByRole('button', { name: /^\${1,4}$/ });
    const count = await options.count();
    expect(count, 'no price-range options found').toBeGreaterThan(0);
    await options.nth(Math.floor(Math.random() * count)).click();
  }

  /** Turns a day on (idempotent) and sets its 24H checkbox. */
  private async enableDay24H(day: string): Promise<void> {
    // Enable the day — Sunday may already be checked; check() is idempotent.
    await this.page.getByRole('checkbox', { name: day, exact: true }).check();

    // That day's 24H is the first checkbox following the day's label; scoping
    // this way avoids matching the other six "24H" checkboxes. The 24H toggle
    // is disabled until the day is enabled above.
    const day24H = this.page.locator(
      `xpath=(//*[normalize-space()='${day}']/following::input[@type='checkbox'])[1]`,
    );
    await day24H.check();
  }

  /**
   * Uploads an image for the section under `label` (e.g. "Profile Photo", "Banner")
   * and confirms with "Upload Original".
   */
  private async uploadImage(label: string, filePath: string): Promise<void> {
    const input = this.page.locator(
      `xpath=//h6[starts-with(normalize-space(),'${label}')]/following::input[@type='file'][1]`,
    );
    await input.setInputFiles(filePath);

    const uploadOriginal = this.page.getByRole('button', { name: /^finish$/i });
    await expect(uploadOriginal).toBeVisible();
    await uploadOriginal.click();
    await expect(uploadOriginal).toBeHidden();
  }

  /* ------------------------------------------------------------------ *
   * Search / selection
   * ------------------------------------------------------------------ */

  async searchShop(name: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.waitForList();
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  async openShop(name: string): Promise<void> {
    await this.page.getByText(name, { exact: true }).first().click();
    await this.waitForList();
  }

  /**
   * Opens the ⋮ actions menu on the search-result row for `name`.
   * The kebab is the last button in that table row.
   */
  private async openRowActions(name: string): Promise<void> {
    const row = this.page.getByRole('row').filter({ hasText: name }).first();
    await row.getByRole('button').last().click();
    await expect(this.page.getByRole('menu')).toBeVisible();
  }

  /* ------------------------------------------------------------------ *
   * Update
   * ------------------------------------------------------------------ */

  async setStatus(name: string, status: 'Active' | 'Inactive'): Promise<void> {
    await this.searchShop(name);
    await this.openRowActions(name);
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();

    await expect(this.formStatusInput).toBeVisible();
    await this.selectAutocompleteLocator(this.formStatusInput, status);

    await this.page.getByRole('button', { name: 'Save changes' }).click();
    await this.waitForList();
  }

  // async filterByStatus(status: 'Active' | 'Inactive'): Promise<void> {
  //   await this.selectAutocompleteLocator(this.filterStatusInput, status);
  //   await this.waitForList();
  // }

  /* ------------------------------------------------------------------ *
   * Delete
   * ------------------------------------------------------------------ */

  async deleteShop(name: string): Promise<void> {
    await this.searchShop(name);
    await this.openRowActions(name);
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();

    const confirmDialog = this.page.getByRole('dialog');
    await confirmDialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await this.waitForList();
  }

  /* ------------------------------------------------------------------ *
   * Assertions
   * ------------------------------------------------------------------ */

  async expectShopVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  async expectShopGone(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
  }

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  /** MUI Autocomplete addressed by its accessible name. Omit `option` for random. */
  private async selectComboByRole(name: string, option?: string): Promise<void> {
    await this.selectAutocompleteLocator(
      this.page.getByRole('combobox', { name }),
      option,
    );
  }

  /** Zone combobox has no accessible name — anchor to its "Zone *" heading. */
  private async selectZone(option?: string): Promise<void> {
    const zone = this.page.locator(
      'xpath=//h6[starts-with(normalize-space(),"Zone")]/following::*[@role="combobox"][1]',
    );
    await this.selectAutocompleteLocator(zone, option);
  }

  private async selectAutocompleteLocator(input: Locator, option?: string): Promise<void> {
    await input.click();

    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    if (option) {
      await listbox.getByRole('option', { name: option, exact: true }).click();
    } else {
      const options = listbox.getByRole('option');
      const count = await options.count();
      expect(count, 'autocomplete has no options to choose from').toBeGreaterThan(0);
      await options.nth(Math.floor(Math.random() * count)).click();
    }

    // Multi-select autocompletes (e.g. Tags) keep the popup open after a pick;
    // Escape closes it. Harmless for single-selects that already closed.
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