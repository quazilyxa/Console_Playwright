import { expect, type Locator } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';
import { TabBar } from '@/consoles/admin/components/TabBar';

export type ParentType = 'Food' | 'Grocery';

export interface ParentData {
  name: string;
  email: string;
  password: string;
  phone: string;
  commission: number;
  parentType: ParentType;
}

/** Photo used for the profile picture upload. Override with PARENT_PHOTO_PATH
 *  in .env when running on another machine. */
const PHOTO_PATH = process.env.PARENT_PHOTO_PATH ?? 'C:\\Users\\quazi\\Downloads\\abc.jpg';

/**
 * ParentsPage — Super Admin "parents" section.
 *
 * Covers: create parent, search, edit (status -> Inactive), filter by status, delete.
 */
export class ParentsPage extends AdminBasePage {
  readonly path = AdminRoutes.parents;
  protected readonly heading = AdminSelectors.headings.parents;

  private readonly tabs = new TabBar(this.page);

  /* ------------------------------------------------------------------ *
   * Locators
   * ------------------------------------------------------------------ */

  private get addNewButton(): Locator {
    return this.page.getByRole('button', { name: 'Add New' });
  }

  private get searchInput(): Locator {
    return this.page.locator('input[name="searchValue"]');
  }

  /** Kebab (⋮) menu in the parent detail header. */
  private get actionsButton(): Locator {
    return this.page.locator('button:has(svg.iconify--heroicons-solid)').last();
  }

  /** Status combobox inside the Add/Edit drawer (no placeholder attribute). */
  private get formStatusInput(): Locator {
    return this.page.locator('#input-autocomplete-status:not([placeholder])');
  }

  /** Status combobox in the list toolbar (has placeholder="Status"). */
  private get filterStatusInput(): Locator {
    return this.page.locator('#input-autocomplete-status[placeholder="Status"]');
  }

  /** Both "Choose date" buttons: index 0 = commission start, index 1 = commission end. */
  private get dateButtons(): Locator {
    return this.page.getByRole('button', { name: /Choose date/i });
  }

  /* ------------------------------------------------------------------ *
   * Tabs
   * ------------------------------------------------------------------ */

  /** Switch to a tab on this page by name (All / Food / Grocery / ...). */
  async openTab(name: string): Promise<void> {
    await this.tabs.select(name);
  }

  /* ------------------------------------------------------------------ *
   * Test data
   * ------------------------------------------------------------------ */

  /** Unique, searchable name that stays under the 15 character limit. */
  static randomParent(overrides: Partial<ParentData> = {}): ParentData {
    const stamp = Date.now().toString().slice(-8); // e.g. 90512345
    return {
      name: `AT-${stamp}`, // 11 chars
      email: `at.${stamp}@mailinator.com`,
      password: 'Dhaka@01',
      phone: '71123456',
      commission: 5 + Math.floor(Math.random() * 6), // 5–10
      parentType: Math.random() < 0.5 ? 'Food' : 'Grocery',
      ...overrides,
    };
  }

  /* ------------------------------------------------------------------ *
   * Create
   * ------------------------------------------------------------------ */

  /**
   * Fills the Add Parent drawer and submits it.
   * Returns the generated data so the test can search for it later.
   */
  async createParent(overrides: Partial<ParentData> = {}): Promise<ParentData> {
    const data = ParentsPage.randomParent(overrides);

    await this.addNewButton.click();
    await expect(this.page.getByText('Add Parent')).toBeVisible();

    await this.page.locator('input[name="name"]').fill(data.name);
    await this.page.locator('input[name="email"]').fill(data.email);
    await this.page.locator('input[name="password"]').fill(data.password);
    await this.page.locator('input[name="confirmPassword"]').fill(data.password);
    await this.page.locator('input[name="phoneNumber"]').fill(data.phone);

    await this.pickAddressFromMap();

    await this.page.locator('input[name="allowTakingOrders"]').check();
    await this.page.locator('input[name="showCustomerNumber"]').check();

    await this.page.locator('input[name="charge.value"]').fill(String(data.commission));

    await this.selectAutocomplete('input-autocomplete-itemType', data.parentType);
    await this.selectAutocomplete('input-autocomplete-businessDevExecutive'); // random option

    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    await this.pickDate(0, today);
    await this.pickDate(1, nextYear);

    await this.uploadProfilePhoto(PHOTO_PATH);

    await this.page.getByRole('button', { name: 'Create', exact: true }).click();
    await this.waitForList();

    return data;
  }

  /** Opens the map dialog and confirms the pre-selected location. */
  private async pickAddressFromMap(): Promise<void> {
    await this.page.getByRole('button', { name: 'directions' }).click();

    const saveButton = this.page.getByRole('button', { name: 'Save', exact: true });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    await expect(saveButton).toBeHidden();
  }

  /**
   * Profile photo: click the dropzone to open the file chooser, attach the file,
   * then confirm with "Upload Original" in the cropper dialog.
   */
  private async uploadProfilePhoto(filePath: string): Promise<void> {
    const dropzone = this.page
      .locator('div[role="presentation"]:has(> input[type="file"][accept="image/*"])')
      .first();
    await expect(dropzone).toBeVisible();

    // Click the inner icon area — avoids the info IconButton in the corner.
    const [chooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      dropzone.locator('.MuiStack-root').first().click(),
    ]);
    await chooser.setFiles(filePath);

    const uploadOriginal = this.page.getByRole('button', { name: /upload original/i });
    await expect(uploadOriginal).toBeVisible();
    await uploadOriginal.click();

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  /* ------------------------------------------------------------------ *
   * Search / selection
   * ------------------------------------------------------------------ */

  async searchParent(name: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.waitForList();
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  /** Selects the parent in the left-hand list so the detail panel loads. */
  async openParent(name: string): Promise<void> {
    await this.page.getByText(name, { exact: true }).first().click();
    await this.waitForList();
  }

  private async openActionsMenu(): Promise<void> {
    await this.actionsButton.click();
    await expect(this.page.getByRole('menu')).toBeVisible();
  }

  /* ------------------------------------------------------------------ *
   * Update
   * ------------------------------------------------------------------ */

  /** Opens Edit from the ⋮ menu, sets the status and saves. */
  async setStatus(name: string, status: 'Active' | 'Inactive'): Promise<void> {
    await this.openParent(name);
    await this.openActionsMenu();
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();

    await expect(this.formStatusInput).toBeVisible();
    await this.selectAutocompleteLocator(this.formStatusInput, status);

    await this.page.getByRole('button', { name: 'Save changes' }).click();
    await this.waitForList();
  }

  /** Toolbar status filter above the list. */
  async filterByStatus(status: 'Active' | 'Inactive'): Promise<void> {
    await this.selectAutocompleteLocator(this.filterStatusInput, status);
    await this.waitForList();
  }

  /* ------------------------------------------------------------------ *
   * Delete
   * ------------------------------------------------------------------ */

  async deleteParent(name: string): Promise<void> {
    await this.openParent(name);
    await this.openActionsMenu();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();

    const confirmDialog = this.page.getByRole('dialog');
    await confirmDialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await this.waitForList();
  }

  /* ------------------------------------------------------------------ *
   * Assertions
   * ------------------------------------------------------------------ */

  async expectParentVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  async expectParentGone(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
  }

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  /** MUI Autocomplete by input id. Omit `option` to pick a random one. */
  private async selectAutocomplete(inputId: string, option?: string): Promise<void> {
    await this.selectAutocompleteLocator(this.page.locator(`#${inputId}`), option);
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

    await expect(listbox).toBeHidden();
  }

  /**
   * Opens the date picker at `index` (0 = start, 1 = end) and selects `target`.
   * Uses the year view when available, then walks months, then clicks the day.
   */
  private async pickDate(index: number, target: Date): Promise<void> {
    await this.dateButtons.nth(index).click();

    const calendar = this.page.getByRole('dialog').last();
    await expect(calendar).toBeVisible();

    const yearSwitch = calendar.getByRole('button', { name: /switch to year view/i });
    if (await yearSwitch.isVisible().catch(() => false)) {
      await yearSwitch.click();
      await calendar.getByRole('radio', { name: String(target.getFullYear()) }).click();
    }

    const label = calendar.locator('.MuiPickersCalendarHeader-label');
    const targetLabel = target.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    for (let i = 0; i < 24; i++) {
      const current = (await label.textContent())?.trim() ?? '';
      if (current === targetLabel) break;

      const forward = new Date(`${current} 1`) < new Date(`${targetLabel} 1`);
      await calendar
        .getByRole('button', { name: forward ? 'Next month' : 'Previous month' })
        .click();
      await this.page.waitForTimeout(150); // slide transition
    }

    await calendar
      .getByRole('gridcell', { name: String(target.getDate()), exact: true })
      .first()
      .click();

    await expect(calendar).toBeHidden();
  }

  /** Waits for the list/table to settle after a mutation or filter change. */
  private async waitForList(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    await expect(this.page.getByRole('progressbar')).toHaveCount(0);
  }
}