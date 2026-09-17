import { expect, type Locator } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';
import { TabBar } from '@/consoles/admin/components/TabBar';

export interface RiderData {
  name: string;
  phone: string;
  email: string;
  password: string;
  dob: string;
  vehicleNumber: string;
}

/** Image used for document uploads. Override with RIDER_PHOTO_PATH in .env. */
const PHOTO_PATH = process.env.RIDER_PHOTO_PATH ?? 'C:\\Users\\quazi\\Downloads\\abc.jpg';

/**
 * RidersPage — Super Admin "riders" section.
 *
 * Create is a 2-step wizard (Details/Password/Address/Vehicle/Employment → Documents).
 * Also covers: search, edit (Employment status -> Inactive), delete.
 */
export class RidersPage extends AdminBasePage {
  readonly path = AdminRoutes.riders;
  protected readonly heading = AdminSelectors.headings.riders;

  private readonly tabs = new TabBar(this.page);

  /* ------------------------------------------------------------------ *
   * Locators
   * ------------------------------------------------------------------ */

  private get addRiderButton(): Locator {
    return this.page.getByRole('button', { name: 'Add Rider' });
  }

  private get searchInput(): Locator {
    return this.page.locator('input[name="searchValue"]');
  }

  /**
   * The open Add/Edit drawer. Scoping form fields to this avoids clashing with
   * the Riders list toolbar, which has its own Zone and Status controls sharing
   * the same ids/labels. Identified by its "Close Drawer" button.
   */
  private get drawer(): Locator {
    return this.page
      .locator('.MuiDrawer-paper')
      .filter({ has: this.page.getByRole('button', { name: 'Close Drawer' }) });
  }

  private get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'Next', exact: true });
  }

  private get saveChangesButton(): Locator {
    return this.page.getByRole('button', { name: 'Save Changes' });
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

  static randomRider(overrides: Partial<RiderData> = {}): RiderData {
    const stamp = Date.now().toString().slice(-8);
    return {
      name: `AT-Rider-${stamp}`,
      phone: `017${Math.floor(10_000_000 + Math.random() * 89_999_999)}`.slice(0, 11),
      email: `at.rider.${stamp}@mailinator.com`,
      password: 'Dhaka@01',
      dob: '01/01/2000',
      vehicleNumber: String(100_000 + Math.floor(Math.random() * 900_000)),
      ...overrides,
    };
  }

  /* ------------------------------------------------------------------ *
   * Create — 2-step wizard
   * ------------------------------------------------------------------ */

  async createRider(overrides: Partial<RiderData> = {}): Promise<RiderData> {
    const data = RidersPage.randomRider(overrides);

    await this.addRiderButton.click();
    await expect(this.page.getByRole('heading', { name: 'Add Rider' })).toBeVisible();

    await this.fillDetailsStep(data);
    await this.nextButton.click();

    await this.fillDocumentsStep();

    // Let the upload register before saving (mirrors the shop banner timing).
    await this.page.waitForTimeout(1000);
    await this.saveChangesButton.click();
    await this.waitForList();

    return data;
  }

  /** Step 1: rider details, password, address, vehicle, employment. */
  private async fillDetailsStep(data: RiderData): Promise<void> {
    await this.page.locator('input[name="name"]').fill(data.name);
    await this.page.locator('input[name="number"]').fill(data.phone);
    await this.page.locator('input[name="email"]').fill(data.email);

    await this.selectMuiSelectByLabel('Nationality'); // random
    await this.page.locator('input[name="dob"]').fill(data.dob);

    // Shift and Rider Equipments are MUI Autocompletes (multi-select chips).
    await this.selectAutocompleteById('input-autocomplete-shifts');
    await this.selectAutocompleteById('input-autocomplete-riderEquipments');

    await this.selectMuiSelectByLabel('Bag Size'); // random

    await this.page.locator('input[name="password"]').fill(data.password);
    await this.page.locator('input[name="confirmPassword"]').fill(data.password);

    await this.page.locator('input[name="address"]').fill('Dhaka');
    await this.selectAutocompleteById('input-autocomplete-zone'); // random

    await this.selectMuiSelectByLabel('Vehicle Type'); // random
    await this.page.locator('input[name="vehicleNumber"]').fill(data.vehicleNumber);

    // Employment Status defaults to "Active" — leave it for create.
    // Full Time Employee toggle (off by default): turn it on.
    await this.page.locator('input[name="fullTimeEmployee"]').check();
  }

  /** Step 2: upload the required Profile Picture. Other docs are optional. */
  private async fillDocumentsStep(): Promise<void> {
    await this.uploadImage('Profile Picture', PHOTO_PATH);
    // Optional docs — uncomment to include:
    await this.uploadImage('National ID', PHOTO_PATH);
    await this.uploadImage('Contact Document', PHOTO_PATH);
    await this.uploadImage('Vehicle Document', PHOTO_PATH);
    await this.uploadImage('Insurance Document', PHOTO_PATH);
    await this.uploadImage('Wikele Document', PHOTO_PATH);
    await this.uploadImage('Proof Of Residence', PHOTO_PATH);
  }

  /**
   * Sets the file on the hidden <input> under `label` and confirms with
   * "Upload Original" (same dropzone/cropper as the shop uploads).
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
    await this.page.waitForTimeout(2000);
  }

  
  /* ------------------------------------------------------------------ *
   * Search / selection
   * ------------------------------------------------------------------ */

  async searchRider(name: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.waitForList();
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  /** Opens the ⋮ actions menu on the search-result row for `name`. */
  // private async openRowActions(name: string): Promise<void> {
  //   const row = this.page.getByRole('row').filter({ hasText: name }).first();
  //   await row.getByRole('button').last().click();
  //   await expect(this.page.getByRole('menu')).toBeVisible();
  // }
  /** Opens the ⋮ actions menu on the search-result row for `name`. */

  private async openRowActions(name: string): Promise<void> {
    const row = this.page
      .getByRole('row')
      .filter({ hasText: name })
      .first();

    await expect(row).toBeVisible({ timeout: 10000 });

    // Target the actual vertical three-dot icon
    const actionButton = row.locator(
      'button:has(svg path[d*="M10 6a2 2"])'
    );

    await expect(actionButton).toBeVisible({ timeout: 5000 });

    // Scroll it into view
    await actionButton.scrollIntoViewIfNeeded();

    // Click the center of the actual button
    await actionButton.click({ position: { x: 20, y: 20 } });

    // Small wait for MUI popover/menu to render
    await this.page.waitForTimeout(300);
  }

  /* ------------------------------------------------------------------ *
   * Update
   * ------------------------------------------------------------------ */

  /**
   * Edits the rider and sets the Employment "Status" to `status`.
   * Status lives on step 1; saving requires advancing to the Documents step,
   * so we click Next (if present) before Save Changes.
   */
  async setStatus(name: string, status: 'Active' | 'Inactive'): Promise<void> {
    await this.searchRider(name);
    await this.openRowActions(name);
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();

    await this.selectMuiSelectByLabel('Status', status);

    if (await this.nextButton.isVisible().catch(() => false)) {
      await this.nextButton.click();
    }
    await this.saveChangesButton.click();
    await this.waitForList();
  }

    async filterByStatus(status: 'Active' | 'Inactive'): Promise<void> {
    const statusInput = this.page.locator('#input-autocomplete-status');

    await expect(statusInput).toBeVisible({ timeout: 10000 });

    // Open Status dropdown
    await statusInput.click();

    // Select the requested status
    const option = this.page.getByRole('option', {
      name: status,
      exact: true,
    });

    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();

    // Verify the selected value
    await expect(statusInput).toHaveValue(status);

    // Wait for filtered results
    await this.waitForList();
  }
  /* ------------------------------------------------------------------ *
   * Delete
   * ------------------------------------------------------------------ */

  async deleteRider(name: string): Promise<void> {
    await this.searchRider(name);
    await this.openRowActions(name);
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

  async expectRiderVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  async expectRiderGone(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
  }

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  /** MUI Autocomplete by input id, scoped to the drawer. Omit `option` for random. */
  private async selectAutocompleteById(id: string, option?: string): Promise<void> {
    await this.selectAutocompleteLocator(this.drawer.locator(`#${id}`), option);
  }

  /** MUI Select (not Autocomplete) anchored to its <label> within the drawer. */
  private async selectMuiSelectByLabel(label: string, option?: string): Promise<void> {
    const combo = this.drawer.locator(
      `xpath=.//label[contains(normalize-space(),"${label}")]/following::*[@role="combobox"][1]`,
    );
    await combo.click();
    await this.pickFromListbox(option);
  }

  private async selectAutocompleteLocator(input: Locator, option?: string): Promise<void> {
    await input.click();
    await this.pickFromListbox(option);
  }

  /** Picks an option from the open listbox (random if `option` omitted), then closes it. */
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

    // Multi-select autocompletes (Shift, Equipments) keep the popup open.
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