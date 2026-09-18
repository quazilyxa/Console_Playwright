import { expect, type Locator } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '../selectors/admin.selectors';


const VENDOR_IMAGE_PATH =
  process.env.VENDOR_IMAGE_PATH ?? 'C:\\Users\\quazi\\Downloads\\abc.jpg';

const log = (scope: string, msg: string, data?: unknown) =>
  console.log(`[${scope}] ${msg}`, data ?? '');

export interface VendorData {
  name: string;
  ownerName: string;
  email: string;
  password: string;
  zone: string;
  type: string;
  parent: string;
  mainPhone: string;
  userPhone: string;
}

export class VendorsPage extends AdminBasePage {
  readonly path = AdminRoutes.vendors; // add this key to AdminRoutes
  protected readonly heading = AdminSelectors.headings.vendors; // add this key too


  private get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'Next', exact: true });
  }

  // ==========================================================
  // Navigation
  // ==========================================================

  async gotoVendors(): Promise<void> {
    const scope = 'gotoVendors';
    log(scope, 'START');

    await expect(
      this.page.getByRole('heading', { name: this.heading })
    ).toBeVisible();

    await this.waitForList();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Random Data
  // ==========================================================

  static randomVendor(): VendorData {
    const stamp = Date.now().toString().slice(-8);

    return {
      name: `AT-Vendor-${stamp}`,
      ownerName: `Owner-${stamp}`,
      email: `at.vendor.${stamp}@mailinator.com`,
      password: `Test${stamp}@1`,
      zone: 'Aley',
      type: '',
      parent: '',
      mainPhone: this.randomLebanesePhone(),
      userPhone: this.randomLebanesePhone(),
    };
  }

  private static randomLebanesePhone(): string {
    const digits = Math.floor(1000000 + Math.random() * 8999999);
    return `${digits}`;
  }


  private get addVendorButton(): Locator {
    return this.page.getByRole('button', { name: 'Add Vendor', exact: true });
  }

  // ==========================================================
  // Create Vendor (Full Wizard)
  // ==========================================================

  async createVendor(): Promise<VendorData> {
    const scope = 'createVendor';
    log(scope, 'START');

    const data = VendorsPage.randomVendor();
    log(scope, 'Generated vendor data', data);

    log(scope, 'Waiting for Add Vendor button...');
    await expect(this.addVendorButton).toBeVisible();
    await this.addVendorButton.click();

    log(scope, 'Waiting for "Add Vendor" heading...');
    await expect(
      this.page.getByRole('heading', { name: 'Add Vendor' })
    ).toBeVisible();

    // ==================================================
    // STEP 1 — DETAILS
    // ==================================================
    log(scope, '=== STEP 1: Details ===');
    await this.fillDetailsStep(data);

    log(scope, 'Clicking Next (Details -> Contacts)...');
    await this.nextButton.click();

    // ==================================================
    // STEP 2 — CONTACTS
    // ==================================================
    log(scope, '=== STEP 2: Contacts ===');
    await this.fillContactsStep(data);

    log(scope, 'Clicking Next (Contacts -> Hours)...');
    await this.nextButton.click();

    // ==================================================
    // STEP 3 — HOURS
    // ==================================================
    log(scope, '=== STEP 3: Hours ===');
    await this.fillHoursStep();

    log(scope, 'Clicking Next (Hours -> Files)...');
    await this.nextButton.click();

    // ==================================================
    // STEP 4 — FILES
    // ==================================================
    log(scope, '=== STEP 4: Files ===');
    await this.fillFilesStep();

    log(scope, 'Clicking Create...');
    const createButton = this.page.getByRole('button', {
      name: 'Create',
      exact: true,
    });
    await expect(createButton).toBeVisible();
    await createButton.click();

    log(scope, 'Waiting for wizard to close / list to refresh...');
    await this.waitForList();

    log(scope, 'DONE', data);
    return data;
  }

  // ==========================================================
  // STEP 1 — Details
  // ==========================================================

  private async fillDetailsStep(data: VendorData): Promise<void> {
    const scope = 'fillDetailsStep';
    log(scope, 'START');

    const nameInput = this.page.locator('input[name="name"]');
    log(scope, `Filling Vendor Name: ${data.name}`);
    await expect(nameInput).toBeVisible();
    await nameInput.fill(data.name);

    const ownerInput = this.page.locator('input[name="ownerName"]');
    log(scope, `Filling Owner Name: ${data.ownerName}`);
    await ownerInput.fill(data.ownerName);

    const emailInput = this.page.locator('input[name="email"]');
    log(scope, `Filling Email: ${data.email}`);
    await emailInput.fill(data.email);

    const passwordInput = this.page.locator('input[name="password"]');
    log(scope, 'Filling Password...');
    await passwordInput.fill(data.password);

    const confirmPasswordInput = this.page.locator(
      'input[name="confirmPassword"]'
    );
    log(scope, 'Filling Confirm Password...');
    await confirmPasswordInput.fill(data.password);

    log(scope, 'Filling Address Map with autocomplete...');
    await this.fillAddressAndSelectSuggestion(
      'Aley Municipality, Aley, Lebanon'
    );

    log(scope, `Selecting Zone: ${data.zone}`);
    await this.selectFromAutocomplete('Zones', data.zone);

    log(scope, 'Selecting random Type...');
    data.type = await this.selectRandomNativeSelectByLabel('Type *');

    log(scope, 'Selecting random Parent...');
    data.parent = await this.selectFromAutocomplete('Parent');

    log(scope, 'Checking "Visibility On App"...');
    const visibilityCheckbox = this.page.locator(
      'input[name="isVisibleToUser"]'
    );
    await visibilityCheckbox.check({ force: true });
    await expect(visibilityCheckbox).toBeChecked();

    log(scope, 'DONE', data);
  }

  // ==========================================================
  // Address Autocomplete
  // ==========================================================

  private async fillAddressAndSelectSuggestion(
    address: string
  ): Promise<void> {
    const scope = 'fillAddressAndSelectSuggestion';
    log(scope, `START address="${address}"`);

    const input = this.page.locator('input[name="address.address"]');
    await expect(input).toBeVisible();
    await input.click();
    await input.fill(address);

    log(scope, 'Waiting for suggestion matching typed address...');
    const suggestion = this.page.getByText(address, { exact: true }).first();
    await expect(suggestion).toBeVisible({ timeout: 10000 });

    log(scope, 'Clicking first suggestion...');
    await suggestion.click();

    log(scope, 'DONE');
  }


  private async selectFromAutocomplete(
    labelSuffix: string,
    exactOptionText?: string
  ): Promise<string> {
    const scope = `selectFromAutocomplete(${labelSuffix})`;
    log(scope, 'START');

    const input = this.page.locator(
      `input[role="combobox"][placeholder="Select ${labelSuffix}"]`
    );

    await expect(input).toBeVisible();
    await input.click();

    const listbox = this.page.getByRole('listbox');
    let opened = await listbox.isVisible().catch(() => false);

    if (!opened) {
      await input.press('ArrowDown');
      opened = await listbox
        .waitFor({ state: 'visible', timeout: 3000 })
        .then(() => true)
        .catch(() => false);
    }

    if (!opened) {
      throw new Error(`Could not open dropdown for "${labelSuffix}"`);
    }

    const options = listbox.getByRole('option');
    const count = await options.count();
    log(scope, `Found ${count} option(s)`);

    if (count === 0) {
      throw new Error(`No options available for "${labelSuffix}"`);
    }

    let chosenOption: Locator;
    let chosenText: string;

    if (exactOptionText) {
      chosenOption = options.filter({ hasText: exactOptionText }).first();
      await expect(chosenOption).toBeVisible();
      chosenText = (await chosenOption.innerText()).trim();
    } else {
      const validIndices: number[] = [];
      for (let i = 0; i < count; i++) {
        const text = (await options.nth(i).innerText()).trim();
        if (text.length > 0) {
          validIndices.push(i);
        }
      }
      log(scope, `Valid (non-blank) option indices: ${validIndices.join(', ')}`);

      if (validIndices.length === 0) {
        throw new Error(`No non-blank options available for "${labelSuffix}"`);
      }

      const randomIndex =
        validIndices[Math.floor(Math.random() * validIndices.length)];
      chosenOption = options.nth(randomIndex);
      chosenText = (await chosenOption.innerText()).trim();
    }

    log(scope, `Selecting option: "${chosenText}"`);
    await chosenOption.click();

    if (exactOptionText) {
      // Multi-select (chip-based, e.g. Zones) — dropdown stays open after pick
      log(scope, 'Pressing Escape to close multi-select dropdown...');
      await this.page.keyboard.press('Escape');
      await expect(listbox).toBeHidden();

      // For chip-based fields, verify via the CHIP, not the input value
      // (input is intentionally cleared after selection in multi-select mode)
      const chip = this.page.locator('.MuiChip-root').filter({ hasText: chosenText });
      const chipVisible = await chip.isVisible().catch(() => false);
      log(scope, `Chip "${chosenText}" visible after selection: ${chipVisible}`);

      if (!chipVisible) {
        throw new Error(
          `"${labelSuffix}" chip for "${chosenText}" not found after selection — value was likely not applied`
        );
      }
    } else {
      // Single-select random pick (e.g. Parent) — dropdown auto-closes on click.
      // Use Tab instead of Escape to avoid clearing the just-selected value.
      log(scope, 'Pressing Tab to move focus without clearing selection...');
      await this.page.keyboard.press('Tab');

      // For single-select fields, the chosen text SHOULD remain in the input
      const finalValue = await input.inputValue();
      log(scope, `Input value after selection: "${finalValue}"`);

      if (!finalValue || finalValue.trim().length === 0) {
        throw new Error(
          `"${labelSuffix}" selection appears empty after picking "${chosenText}" — value was likely cleared`
        );
      }
    }

    log(scope, 'DONE', chosenText);
    return chosenText;
  }

  // ==========================================================
  // Native MuiSelect Helper (Type / Status)
  // ==========================================================

  private async selectRandomNativeSelectByLabel(
    labelText: string
  ): Promise<string> {
    const scope = `selectRandomNativeSelectByLabel(${labelText})`;
    log(scope, 'START');

    const container = this.page.locator(
      `xpath=//h6[normalize-space()="${labelText}"]/following-sibling::div[1]`
    );

    const trigger = container.locator('[role="combobox"]');
    await expect(trigger).toBeVisible();
    log(scope, 'Clicking select trigger...');
    await trigger.click();

    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    const options = listbox.getByRole('option');
    const count = await options.count();
    log(scope, `Found ${count} option(s)`);

    if (count === 0) {
      throw new Error(`No options available for "${labelText}"`);
    }

    const randomIndex = Math.floor(Math.random() * count);
    const chosenOption = options.nth(randomIndex);
    const chosenText = (await chosenOption.innerText()).trim();

    log(scope, `Selecting option: "${chosenText}"`);
    await chosenOption.click();

    await expect(listbox).toBeHidden();

    log(scope, 'DONE', chosenText);
    return chosenText;
  }

  // ==========================================================
  // STEP 2 — Contacts
  // ==========================================================

  private async fillContactsStep(data: VendorData): Promise<void> {
    const scope = 'fillContactsStep';
    log(scope, 'START');

    const mainPhoneInput = this.page.locator('input[name="phoneNumber"]');
    log(scope, `Filling main point of contact: ${data.mainPhone}`);
    await expect(mainPhoneInput).toBeVisible();
    await mainPhoneInput.fill(data.mainPhone);

    const userPhoneInput = this.page.locator(
      'input[name="userPhoneNumber"]'
    );
    log(scope, `Filling user point of contact: ${data.userPhone}`);
    await userPhoneInput.fill(data.userPhone);

    log(scope, 'DONE');
  }

  // ==========================================================
  // STEP 3 — Hours
  // ==========================================================

  private async fillHoursStep(): Promise<void> {
    const scope = 'fillHoursStep';
    log(scope, 'START');

    const daysToEnable = ['Sunday', 'Monday', 'Tuesday'];

    for (const day of daysToEnable) {
      log(scope, `Enabling day: ${day}`);
      await this.enableDayWith24Hours(day);
    }

    log(scope, 'DONE');
  }

  private async enableDayWith24Hours(dayName: string): Promise<void> {
    const scope = `enableDayWith24Hours(${dayName})`;
    log(scope, 'START');

    const dayLabel = this.page.locator(
      `xpath=//span[normalize-space()="${dayName}"]/ancestor::label[1]`
    );
    const daySwitchInput = dayLabel.locator('input[type="checkbox"]');

    log(scope, 'Toggling day switch ON...');
    await daySwitchInput.check({ force: true });
    await expect(daySwitchInput).toBeChecked();

    // 24H checkbox sits in a sibling label within the same row container
    const rowContainer = dayLabel.locator(
      'xpath=ancestor::div[contains(@class,"css-19oyo9j")][1]'
    );
    const twentyFourHourInput = rowContainer
      .locator('label')
      .filter({ hasText: '24H' })
      .locator('input[type="checkbox"]');

    const isChecked = await twentyFourHourInput.isChecked().catch(() => false);
    log(scope, `24H checkbox already checked: ${isChecked}`);

    if (!isChecked) {
      log(scope, 'Checking 24H checkbox...');
      await twentyFourHourInput.check({ force: true });
      await expect(twentyFourHourInput).toBeChecked();
    }

    log(scope, 'DONE');
  }

  // ==========================================================
  // STEP 4 — Files
  // ==========================================================

  private async fillFilesStep(): Promise<void> {
    const scope = 'fillFilesStep';
    log(scope, 'START');

    const fieldLabels = [
      'Profile Photo',
      'Banner',
      'Commercial Circular Document',
      'National ID',
      'Contact Paper',
      'Tax Registration',
    ];

    for (let i = 0; i < fieldLabels.length; i++) {
      log(scope, `Uploading image for "${fieldLabels[i]}" (index ${i})...`);
      await this.uploadImageByIndex(i, fieldLabels[i], VENDOR_IMAGE_PATH);
    }

    log(scope, 'DONE');
  }

  private async uploadImageByIndex(
    index: number,
    fieldName: string,
    filePath: string
  ): Promise<void> {
    const scope = `uploadImageByIndex(${fieldName})`;
    log(scope, 'START', filePath);

    const allDropzones = this.page.locator(
      'div.mnl__upload div[role="presentation"]:has(> input[type="file"][accept="image/*"])'
    );

    const count = await allDropzones.count();
    log(scope, `Found ${count} dropzone(s) on page`);

    if (count <= index) {
      await this.page.screenshot({
        path: `debug-no-dropzone-${fieldName}.png`,
        fullPage: true,
      });
      throw new Error(
        `Expected at least ${index + 1} dropzone(s) for "${fieldName}", found ${count}`
      );
    }

    const dropzone = allDropzones.nth(index);
    await expect(dropzone).toBeVisible();

    const fileInput = dropzone.locator(
      'input[type="file"][accept="image/*"]'
    );

    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    log(scope, 'Setting file on hidden input...');
    await fileInput.setInputFiles(filePath);

    await this.page.waitForTimeout(500);


    const finishButton = this.page.getByRole('button', {
      name: /^finish$/i,
    });
    const finishVisible = await finishButton.isVisible().catch(() => false);
    log(scope, `Finish button visible: ${finishVisible}`);

    if (finishVisible) {
      await finishButton.click();
      await expect(finishButton).toBeHidden();
    }

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
    log(scope, 'DONE');
  }

  async clickCreateButton() {
    const scope = 'clickCreateButton';
    const createButton = this.page.getByRole('button', { name: /^create$/i });
    const createVisible = await createButton.isVisible().catch(() => false);
    log(scope, `Create button visible: ${createVisible}`);

    if (createVisible) {
      await createButton.click();
    }
    await this.page.waitForTimeout(2000); // Wait for any potential UI updates

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
    log(scope, 'Create DONE');
  }

  // ==========================================================
  // Search
  // ==========================================================

  private get searchInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /search/i })
      .or(this.page.locator('input[placeholder*="Search" i]'))
      .or(this.page.locator('input[name="searchValue"]'))
      .first();
  }

  async searchVendor(name: string): Promise<void> {
    const scope = 'searchVendor';
    log(scope, `START: Searching for "${name}"`);
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.waitForList();
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible({ timeout: 10000 });
    log(scope, 'DONE: Vendor found in search results');
  }

  async clearSearch(): Promise<void> {
    const scope = 'clearSearch';
    log(scope, 'START');
    await this.searchInput.click();
    await this.searchInput.fill('');
    await this.waitForList();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Row Actions (3-dot Kebab Menu)
  // ==========================================================

  private async openRowActions(name: string): Promise<void> {
    const scope = 'openRowActions';
    log(scope, `Opening action menu for "${name}"`);

    // 1. Locate the vendor text cell in the table
    const vendorCell = this.page.getByText(name, { exact: true }).first();
    await expect(vendorCell).toBeVisible({ timeout: 15000 });

    // 2. Locate the row container containing this vendor
    const row = vendorCell.locator('xpath=ancestor::*[@role="row"][1]');
    const isRowVisible = await row.isVisible().catch(() => false);

    // 3. Find the 3-dot action button in THIS row
    const actionBtn = isRowVisible
      ? row.locator('button:has(svg), .MuiIconButton-root, button[aria-haspopup="menu"]').last()
      : this.page.locator('.MuiButtonBase-root.MuiIconButton-root:has(svg), button:has(svg.iconify--heroicons-solid)').last();

    await actionBtn.scrollIntoViewIfNeeded();
    await expect(actionBtn).toBeVisible({ timeout: 10000 });

    // 4. Click with force: true to bypass MUI tooltip overlays that block clicks
    await actionBtn.click({ force: true });

    // 5. Verify menu opened; retry if tooltip intercepted
    const menu = this.page.getByRole('menu');
    const menuOpened = await menu
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    if (!menuOpened) {
      log(scope, 'Menu did not open on first click, retrying click...');
      await actionBtn.click({ force: true });
      await expect(menu).toBeVisible({ timeout: 5000 });
    }

    log(scope, 'Action menu opened successfully');
  }


  // ==========================================================
  // Update Vendor
  // ==========================================================

  async updateOwnerName(vendorName: string, newOwnerName: string): Promise<void> {
    const scope = 'updateOwnerName';
    log(scope, `START: Update owner to "${newOwnerName}" for vendor "${vendorName}"`);

    await this.searchVendor(vendorName);
    await this.openRowActions(vendorName);

    log(scope, 'Clicking Edit in menu...');
    await this.page.getByRole('menuitem', { name: 'Edit' }).click({ force: true });

    const ownerInput = this.page
      .getByRole('textbox', { name: 'Owner Name *' })
      .or(this.page.locator('input[name="ownerName"]'))
      .first();

    await expect(ownerInput).toBeVisible({ timeout: 10000 });
    log(scope, `Filling new owner name: ${newOwnerName}`);
    await ownerInput.click();
    await ownerInput.press('ControlOrMeta+a');
    await ownerInput.fill(newOwnerName);

    log(scope, 'Clicking Save changes...');
    const saveButton = this.page.getByRole('button', { name: 'Save changes', exact: true });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await saveButton.click();

    await this.waitForList();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Delete Vendor
  // ==========================================================

  async deleteVendor(vendorName: string): Promise<void> {
    const scope = 'deleteVendor';
    log(scope, `START: Delete vendor "${vendorName}"`);

    await this.searchVendor(vendorName);
    await this.openRowActions(vendorName);

    log(scope, 'Clicking Delete in menu...');
    await this.page.getByRole('menuitem', { name: 'Delete' }).click({ force: true });

    log(scope, 'Confirming Delete...');
    const confirmButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete', exact: true })
      .or(this.page.getByRole('button', { name: 'Delete', exact: true }).last());

    await expect(confirmButton).toBeVisible({ timeout: 10000 });
    await confirmButton.click();

    await this.waitForList();
    await this.clearSearch();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Assertions
  // ==========================================================

  async expectVendorVisible(name: string): Promise<void> {
    const scope = 'expectVendorVisible';
    log(scope, `Verifying "${name}" is visible...`);
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible({ timeout: 10000 });
    log(scope, 'CONFIRMED visible');
  }

  async expectVendorGone(name: string): Promise<void> {
    const scope = 'expectVendorGone';
    log(scope, `Verifying "${name}" is deleted / gone...`);
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.waitForList();
    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
    await this.clearSearch();
    log(scope, 'CONFIRMED gone');
  }

  // ==========================================================
  // Wait (shared)
  // ==========================================================

  private async waitForList(): Promise<void> {
    const scope = 'waitForList';
    log(scope, 'Waiting for network idle...');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    log(scope, 'Checking progressbar count is 0...');
    await expect(this.page.getByRole('progressbar')).toHaveCount(0);
    log(scope, 'DONE');
  }
}

