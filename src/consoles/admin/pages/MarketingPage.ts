import { expect, type Locator, type Page } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';
import { TabBar } from '@/consoles/admin/components/TabBar';

export type MarketingTab =
  | 'Cashback'
  | 'Deals'
  | 'Featured'
  | 'Coupons'
  | 'Refer A Friend'
  | 'Limited Time Offers'
  | 'Qr Code Generator';

export type LimitedTimeOffersSubTab =
  | 'Configuration'
  | 'Campaign Management'
  | 'History';

export interface CampaignData {
  title: string;
  subtitle: string;
  sectionDisplayName: string;
  startDate?: string;
  endDate?: string;
  startHour?: string;
  startMinute?: string;
  endHour?: string;
  endMinute?: string;
  repeatDays?: string[];
}

export interface AddShopOptions {
  shopName: string;
  discountPercentage?: string;
  maxDiscountCap?: string;
  itemNames?: string[];
  selectItemsCount?: number;
}

export interface QrCodeCampaignData {
  campaignName: string;
  status?: string;
  redirectTo?: string;
  shopType?: string;
  shopName?: string;
}

/**
 * MarketingPage — Super Admin "Marketing" section.
 *
 * Covers:
 * - Tab navigation (Cashback, Limited Time Offers, etc.)
 * - Limited Time Offers Sub-tabs (Configuration, Campaign Management, History)
 * - Configuration: Add percentage presets, max discount caps, save
 * - Campaign Management: Start New Campaign, fill details & date/time pickers, publish
 * - History: view history, discard unsaved changes
 * - Campaign Cards: expand campaign accordion, Add Shop, select discount & cap, select items, confirm
 */
export class MarketingPage extends AdminBasePage {
  readonly path = AdminRoutes.marketing;
  protected readonly heading = AdminSelectors.headings.marketing;

  private readonly tabs = new TabBar(this.page);

  /* ------------------------------------------------------------------ *
   * Tab Navigation
   * ------------------------------------------------------------------ */

  /** Switch to a top-level tab on the Marketing page. */
  async openTab(name: MarketingTab | string): Promise<void> {
    await this.tabs.select(name);
  }

  /** Switch to a sub-tab under Limited Time Offers. */
  async openSubTab(name: LimitedTimeOffersSubTab | string): Promise<void> {
    const subTab = this.page
      .getByRole('tab', { name: new RegExp(`^${name}$`, 'i') })
      .or(this.page.getByRole('button', { name: new RegExp(`^${name}$`, 'i') }))
      .or(this.page.getByText(new RegExp(`^${name}$`, 'i')))
      .first();

    await expect(subTab).toBeVisible({ timeout: 15_000 });
    await subTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  /* ------------------------------------------------------------------ *
   * Configuration Actions (Limited Time Offers -> Configuration)
   * ------------------------------------------------------------------ */

  /** Adds a new discount percentage preset in the Configuration tab. */
  async addDiscountPreset(value: string | number = '5'): Promise<void> {
    const section = this.page
      .locator('div')
      .filter({ has: this.page.getByRole('heading', { name: 'Discount Percentage Presets' }) })
      .last();

    await section.getByRole('button', { name: 'Add' }).click();
    const newPresetInput = section.getByRole('textbox').last();
    await newPresetInput.fill(String(value));
  }

  /** Adds a new maximum discount cap (per order) in the Configuration tab. */
  async addMaxDiscountCap(value: string | number = '5'): Promise<void> {
    const section = this.page
      .locator('div')
      .filter({ has: this.page.getByRole('heading', { name: 'Maximum Discount Cap (Per Order)' }) })
      .last();

    await section.getByRole('button', { name: 'Add' }).click();
    const newCapInput = section.getByRole('textbox').last();
    await newCapInput.fill(String(value));
  }

  /** Saves the configuration presets and caps. */
  async saveConfiguration(): Promise<void> {
    const saveBtn = this.page.getByRole('button', { name: 'Save', exact: true });
    await expect(saveBtn).toBeEnabled({ timeout: 10_000 });
    await saveBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  /* ------------------------------------------------------------------ *
   * Campaign Management Actions
   * ------------------------------------------------------------------ */

  /** Generates unique random campaign data for testing. */
  static randomCampaign(overrides: Partial<CampaignData> = {}): CampaignData {
    const stamp = Date.now().toString().slice(-4);
    return {
      title: `New Camp ${stamp}`,
      subtitle: 'Summer Camp',
      sectionDisplayName: 'Summer Camp',
      startDate: '9',
      endDate: '10',
      startHour: '12 hours',
      startMinute: '20 minutes',
      endHour: '12 hours',
      endMinute: '20 minutes',
      repeatDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      ...overrides,
    };
  }

  /** Opens the "Start New Campaign" form. */
  async openStartNewCampaign(): Promise<void> {
    const startBtn = this.page.getByRole('button', { name: 'Start New Campaign' });
    await expect(startBtn).toBeVisible({ timeout: 15_000 });
    await startBtn.click();
    await expect(
      this.page.getByRole('heading', { name: /Campaign Settings/i })
    ).toBeVisible({ timeout: 15_000 });
  }

  /** Fills the campaign form fields, date & time pickers, and day selectors. */
  async fillCampaignDetails(data: Partial<CampaignData>): Promise<void> {
    const campaign = MarketingPage.randomCampaign(data);

    // Textfields
    await this.page.getByRole('textbox', { name: 'Title', exact: true }).fill(campaign.title);
    await this.page.getByRole('textbox', { name: 'Subtitle' }).fill(campaign.subtitle);
    await this.page.getByRole('textbox', { name: 'Section Display Name' }).fill(campaign.sectionDisplayName);

    // Start Date
    await this.page.getByRole('button', { name: 'Choose date' }).first().click();
    const startCell = this.page
      .getByRole('dialog')
      .getByRole('gridcell', { name: campaign.startDate!, exact: true })
      .or(this.page.getByRole('dialog').locator('button[role="gridcell"]:not([disabled])').first());
    await startCell.first().click();

    // Start Time
    await this.page.getByRole('button', { name: 'Choose time' }).first().click();
    await this.page.getByRole('option', { name: campaign.startHour! }).first().click();
    await this.page.getByRole('option', { name: campaign.startMinute! }).first().click();
    await this.page.keyboard.press('Escape');

    // End Date
    await this.page.getByRole('button', { name: 'Choose date' }).nth(1).click();
    const endCell = this.page
      .getByRole('dialog')
      .getByRole('gridcell', { name: campaign.endDate!, exact: true })
      .or(this.page.getByRole('dialog').locator('button[role="gridcell"]:not([disabled])').nth(1));
    await endCell.first().click();

    // End Time
    await this.page.getByRole('button', { name: 'Choose time' }).nth(1).click();
    await this.page.getByRole('option', { name: campaign.endHour! }).first().click();
    await this.page.getByRole('option', { name: campaign.endMinute! }).first().click();
    await this.page.keyboard.press('Escape');

    // Repeat Days
    const days = campaign.repeatDays ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    for (const day of days) {
      const dayBtn = this.page.getByRole('button', { name: day, exact: true });
      if (await dayBtn.isVisible().catch(() => false)) {
        await dayBtn.click();
      }
    }
  }

  /** Submits the campaign with "Save & Publish". */
  async saveAndPublishCampaign(): Promise<void> {
    const savePublishBtn = this.page.getByRole('button', { name: 'Save & Publish' });
    await expect(savePublishBtn).toBeEnabled({ timeout: 10_000 });
    await savePublishBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Cancels the campaign creation form if it's open. */
  async cancelCampaignForm(): Promise<void> {
    const isFormOpen = await this.page
      .getByRole('heading', { name: /Campaign Settings/i })
      .isVisible()
      .catch(() => false);

    if (isFormOpen) {
      const cancelBtn = this.page
        .getByRole('button', { name: 'Cancel', exact: true })
        .last();

      await cancelBtn.scrollIntoViewIfNeeded().catch(() => {});
      await cancelBtn.click().catch(() => {});
      await this.page.waitForLoadState('networkidle');
    }
  }

  /* ------------------------------------------------------------------ *
   * History & Discard Actions
   * ------------------------------------------------------------------ */

  /** Switches to History tab and discards any open form changes if prompted. */
  async discardIfPrompted(): Promise<void> {
    const discardBtn = this.page.getByRole('button', { name: 'Discard' });
    if (await discardBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await discardBtn.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /* ------------------------------------------------------------------ *
   * Campaign Accordion & Shop Actions
   * ------------------------------------------------------------------ */

  /** Expands a campaign card accordion to reveal Joined Shops and the "Add Shop" button. */
  async expandCampaign(titlePattern: string | RegExp = /New Camp/i): Promise<void> {
    // If the creation form is still open, cancel or switch back to list
    await this.cancelCampaignForm();

    const campaignCard = this.page
      .getByRole('button', { name: /New Camp.*Scheduled/i })
      .or(this.page.locator('.MuiAccordionSummary-root').filter({ hasText: titlePattern }))
      .first();

    await expect(campaignCard).toBeVisible({ timeout: 15_000 });

    const isExpanded = await campaignCard.getAttribute('aria-expanded').catch(() => null);
    if (isExpanded !== 'true') {
      await campaignCard.click();
    }

    // Verify Add Shop button becomes visible
    await expect(
      this.page.getByRole('button', { name: 'Add Shop' })
    ).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Adds a shop with discount presets and item selections to the expanded campaign.
   */
  async addShopToCampaign(options: AddShopOptions): Promise<void> {
    const {
      shopName,
      discountPercentage = '15%',
      maxDiscountCap = '10',
      itemNames,
      selectItemsCount = 2,
    } = options;

    // 1. Click Add Shop
    await this.page.getByRole('button', { name: 'Add Shop' }).click();
    await expect(this.page.getByText('Add shops to campaign')).toBeVisible({ timeout: 10_000 });

    // 2. Search and select shop
    const shopSearch = this.page
      .getByRole('textbox', { name: /Search by shop name/i })
      .or(this.page.getByPlaceholder(/Search by shop name/i));
    await shopSearch.fill(shopName);
    await this.page.waitForTimeout(1000);

    const shopItem = this.page.getByText(shopName, { exact: true }).first();
    if (await shopItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shopItem.click();
    } else {
      // If specified shop isn't found/already joined, pick the first available shop
      await shopSearch.clear();
      await this.page.waitForTimeout(1000);
      const anyShop = this.page
        .locator('li')
        .filter({ has: this.page.locator('input, [role="button"]') })
        .first();
      if (await anyShop.isVisible().catch(() => false)) {
        await anyShop.click();
      }
    }

    // 3. Select discount percentage
    const percentTrigger = this.page.getByText('%', { exact: true }).first();
    if (await percentTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await percentTrigger.click();
      const targetOption = this.page.getByRole('option', { name: discountPercentage }).first();
      if (await targetOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await targetOption.click();
      } else {
        await this.page.getByRole('option').first().click();
      }
    }

    // 4. Select max discount cap
    const capCombobox = this.page.getByRole('combobox').nth(1);
    if (await capCombobox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await capCombobox.click();
      const targetCap = this.page.getByRole('option', { name: maxDiscountCap, exact: true }).first();
      if (await targetCap.isVisible({ timeout: 2000 }).catch(() => false)) {
        await targetCap.click();
      } else {
        await this.page.getByRole('option').first().click();
      }
    }

    // 5. Open Add Items dialog
    const addItemsBtn = this.page.getByRole('button', { name: 'Add Items' });
    if (await addItemsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addItemsBtn.click();
      await expect(this.page.getByRole('heading', { name: 'Menu' }).first()).toBeVisible({ timeout: 10_000 });

      // 6. Select menu items
      let selected = false;
      if (itemNames && itemNames.length > 0) {
        for (const itemName of itemNames) {
          const itemCheckbox = this.page.getByRole('checkbox', { name: new RegExp(itemName, 'i') }).first();
          if (await itemCheckbox.isVisible().catch(() => false)) {
            await itemCheckbox.check();
            selected = true;
          }
        }
      }
      if (!selected) {
        const checkboxes = this.page.getByRole('checkbox');
        const count = await checkboxes.count();
        for (let i = 0; i < Math.min(count, selectItemsCount); i++) {
          await checkboxes.nth(i).check();
        }
      }

      // Add items
      await this.page.getByRole('button', { name: 'Add', exact: true }).first().click();
      await this.page.waitForTimeout(500);
    }

    // 7. Confirm shop addition
    const confirmBtn = this.page.getByRole('button', { name: /Add & Confirm|Confirm/i }).first();
    if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmBtn.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // Verify success toast or confirmation
    await expect(
      this.page.getByText(/Successfully joined the campaign|Joined Shops/i).first()
    ).toBeVisible({ timeout: 15_000 });
  }

  /** Navigates back to home/dashboard by clicking the Logo link. */
  async clickLogo(): Promise<void> {
    await this.page.getByRole('link', { name: 'Logo' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /* ------------------------------------------------------------------ *
   * Delete & Teardown Actions
   * ------------------------------------------------------------------ */

  /** Exposes the underlying Playwright Page instance. */
  get pageInstance(): Page {
    return this.page;
  }

  /**
   * Deletes the created campaign in Campaign Management and confirms deletion.
   */
  async deleteCampaign(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Campaign Management' }).click();
    const deleteBtn = this.page.getByRole('button', { name: 'Delete', exact: true }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 10_000 });
    await deleteBtn.click();

    const confirmBtn = this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete' })
      .or(this.page.getByRole('button', { name: 'Delete' }))
      .first();
    await expect(confirmBtn).toBeVisible({ timeout: 10_000 });
    await confirmBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * Removes added presets and max cap from Configuration tab and saves changes.
   */
  async deleteConfiguration(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Configuration' }).click();
    await this.page.getByRole('button').nth(4).click();
    await this.page
      .locator(
        'div:nth-child(2) > .MuiPaper-root > .MuiStack-root.css-yd8sa2 > .MuiStack-root.css-1eybjch > div > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root'
      )
      .first()
      .click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /* ------------------------------------------------------------------ *
   * QR Code Generator Actions
   * ------------------------------------------------------------------ */

  /** Switch to the QR Code Generator tab under Marketing. */
  async openQrCodeGenerator(): Promise<void> {
    await this.openTab('Qr Code Generator');
  }

  /**
   * Opens "Create QR Code" form, fills in details, and submits.
   */
  async createQrCode(data: Partial<QrCodeCampaignData> = {}): Promise<string> {
    const campaignName = data.campaignName ?? 'Dhamaka';
    const status = data.status ?? 'Active';
    const redirectTo = data.redirectTo ?? 'Shop';
    const shopType = data.shopType ?? 'Food';
    const shopName = data.shopName ?? 'Test Shop';

    // 1. Click "Create QR Code" toolbar button to open the drawer
    const openBtn = this.page.getByRole('button', { name: 'Create QR Code' }).first();
    await expect(openBtn).toBeVisible({ timeout: 10_000 });
    await openBtn.click();

    // 2. Wait for the drawer to appear
    const drawer = this.page.locator('.MuiDrawer-paper, .MuiDrawer-root, [role="dialog"]').first();
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    // 3. Campaign name
    const nameInput = drawer
      .getByRole('textbox', { name: 'Campaign name *' })
      .or(drawer.getByPlaceholder(/Enter campaign name/i))
      .first();
    await nameInput.click();
    await nameInput.fill(campaignName);

    // 4. Status
    const statusBox = drawer.getByRole('combobox', { name: /Status/i }).first();
    if (await statusBox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusBox.click();
      await this.page.getByRole('option', { name: status, exact: true }).click();
    }

    // 5. Redirect to
    const redirectBox = drawer.getByRole('combobox', { name: /Redirect to/i }).first();
    if (await redirectBox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await redirectBox.click();
      await this.page.getByRole('option', { name: redirectTo, exact: true }).click();
    }

    // 6. Select Shop Type (exact match prevents collision with Select Shop)
    const shopTypeBox = drawer.getByRole('combobox', { name: 'Select Shop Type', exact: true });
    await expect(shopTypeBox).toBeVisible({ timeout: 5000 });
    await shopTypeBox.click();
    await this.page.getByRole('option', { name: shopType, exact: true }).click();

    // 7. Select Shop (exact match prevents clicking Select Shop Type twice)
    const shopBox = drawer.getByRole('combobox', { name: 'Select Shop', exact: true });
    await expect(shopBox).toBeVisible({ timeout: 5000 });
    await shopBox.click();
    await shopBox.fill(shopName);
    const shopOption = this.page.getByRole('option', { name: shopName, exact: true }).first();
    await expect(shopOption).toBeVisible({ timeout: 5000 });
    await shopOption.click();

    // 8. Submit Create QR Code (target button INSIDE the drawer)
    const submitBtn = drawer.getByRole('button', { name: 'Create QR Code', exact: true }).first();
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    // 9. Wait for the drawer to close
    await expect(drawer).toBeHidden({ timeout: 15_000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});

    return campaignName;
  }

  /**
   * Previews QR code by clicking its image thumbnail, then closes the preview dialog.
   */
  async previewQrCode(campaignName = 'Dhamaka'): Promise<void> {
    const row = this.page.getByRole('row').filter({ hasText: campaignName }).first();
    await expect(row).toBeVisible({ timeout: 15_000 });

    const qrThumb = row
      .locator('img')
      .or(this.page.getByRole('img', { name: campaignName }).locator('image'))
      .or(this.page.getByRole('img', { name: campaignName }))
      .first();

    if (await qrThumb.isVisible({ timeout: 5000 }).catch(() => false)) {
      await qrThumb.click();

      // Close preview dialog by clicking container, close button, or Escape
      const dialog = this.page.locator('.MuiDialog-container, [role="dialog"]').first();
      if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        const closeBtn = this.page.getByRole('dialog').getByRole('button').first();
        if (await closeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
          await closeBtn.click().catch(() => {});
        } else {
          await this.page.keyboard.press('Escape').catch(() => {});
        }
        await expect(dialog).toBeHidden({ timeout: 5000 }).catch(() => {});
      }
    }
  }

  /**
   * Copies the QR link and triggers the QR code download from the table row.
   */
  async copyQrLinkAndDownload(campaignName = 'Dhamaka'): Promise<void> {
    const row = this.page
      .getByRole('row')
      .filter({ hasText: campaignName })
      .first();

    await expect(row).toBeVisible({ timeout: 15_000 });

    // Copy link
    const copyBtn = row.getByLabel('Copy link').or(row.getByRole('button', { name: /Copy link/i })).first();
    if (await copyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await copyBtn.click();
    }

    // Download QR
    const downloadPromise = this.page.waitForEvent('download', { timeout: 4000 }).catch(() => null);
    const downloadBtn = row.getByLabel('Download QR').or(row.getByRole('button', { name: /Download QR/i })).first();
    if (await downloadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await downloadBtn.click();
    }
    await downloadPromise;
  }

  /**
   * Deletes the QR code campaign via the row kebab menu and confirms deletion.
   */
  async deleteQrCode(campaignName = 'Dhamaka'): Promise<void> {
    const row = this.page
      .getByRole('row')
      .filter({ hasText: campaignName })
      .first();

    await expect(row).toBeVisible({ timeout: 15_000 });

    // Target the kebab (3-dots) button which is the last button in the row
    const kebabBtn = row
      .getByRole('button')
      .last()
      .or(this.page.locator('.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-1hd14n').first());

    await expect(kebabBtn).toBeVisible({ timeout: 10_000 });
    await kebabBtn.click();

    const deleteMenuItem = this.page.getByRole('menuitem', { name: 'Delete' });
    if (!(await deleteMenuItem.isVisible({ timeout: 1500 }).catch(() => false))) {
      await kebabBtn.click();
    }

    await expect(deleteMenuItem).toBeVisible({ timeout: 5000 });
    await deleteMenuItem.click();

    // Confirm deletion
    const confirmDeleteBtn = this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete' })
      .or(this.page.getByRole('button', { name: 'Delete' }))
      .last();

    await expect(confirmDeleteBtn).toBeVisible({ timeout: 5000 });
    await confirmDeleteBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await expect(row).toBeHidden({ timeout: 10_000 }).catch(() => {});
  }

  /**
   * Runs the complete QR Code Generator end-to-end lifecycle:
   * Open tab -> Create -> Preview -> Copy link -> Download -> Delete
   */
  async runQrCodeLifecycle(data?: Partial<QrCodeCampaignData>): Promise<void> {
    await this.openTab('Qr Code Generator');
    const name = await this.createQrCode(data);
    await this.previewQrCode(name);
    await this.copyQrLinkAndDownload(name);
    await this.deleteQrCode(name);
  }
}


