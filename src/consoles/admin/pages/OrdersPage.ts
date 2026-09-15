import { AdminBasePage } from "@/consoles/admin/pages/AdminBasePage";
import { AdminRoutes } from "@/consoles/admin/config/admin.routes";
import { AdminSelectors } from "@/consoles/admin/selectors/admin.selectors";
import { expect, Locator } from "@playwright/test";

/**
 * OrdersPage — Super Admin "orders" section.
 */
export class OrdersPage extends AdminBasePage {
  readonly path = AdminRoutes.orders;
  protected readonly heading = AdminSelectors.headings.orders;

  private lastOrderId = "";

  private get searchBox(): Locator {
    return this.page.locator('input[name="searchValue"]');
  }

  /** Search by term (e.g. "Tokyo"); the order list filters. */
  async searchOrders(term: string): Promise<void> {
    await this.searchBox.click();
    await this.searchBox.fill("");
    await this.searchBox.fill(term);
    await this.page.waitForLoadState("networkidle");
    await this.searchBox.blur(); // free focus before clicking a result
    await this.page.waitForTimeout(3000);
  }

  /** The order-id button inside the first row whose status is "Placed". */
  private placedOrderButton(): Locator {
    return this.page
      .locator(".MuiDataGrid-row", {
        has: this.page.locator('[data-field="status"]', { hasText: "Placed" }),
      })
      .first()
      .locator('[data-field="order"] button');
  }

  /** Open the first Placed order from the filtered list. Returns its id. */
  async openFirstPlacedOrder(): Promise<string> {
    const btn = this.placedOrderButton();
    await expect(btn).toBeVisible();
    const id = (await btn.innerText()).trim();
    this.lastOrderId = id;
    await btn.click();
    await expect(this.page.getByText(`Order #${id}`)).toBeVisible();
    return id;
  }

  /** Scroll the order-details sidebar to the bottom, pause, then back to top. */
  async reviewOrderDetails(): Promise<void> {
    await this.page.mouse.wheel(0, 3000); // scroll down
    await this.page.waitForTimeout(2000);
    await this.page.mouse.wheel(0, -3000); // back to top
    await this.page.waitForTimeout(500);
  }

  // async changeAddress(): Promise<void> {
  //   await this.page.getByRole("button", { name: /^change address$/i }).click();
  //   await expect(this.page.getByText(/change address/i)).toBeVisible();

  //   // Pick a random address from the dialog.
  //   const addresses = this.page
  //     .getByRole("dialog")
  //     .locator("button.MuiIconButton-root");

  //   await expect(addresses.first()).toBeVisible();

  //   const count = await addresses.count();
  //   const randomIndex = Math.floor(Math.random() * count);

  //   await addresses.nth(randomIndex).click();

  //   await this.page.getByRole("button", { name: /^update$/i }).click();
  //   await this.page.waitForLoadState("networkidle");
  // }

  // ---- Adjust Order ----
  // async adjustOrder(): Promise<void> {
  //   // Wait for the sidebar buttons to reappear after the address reload.
  //   await expect(
  //     this.page.getByRole("button", { name: /^adjust order$/i }),
  //   ).toBeVisible();
  //   await this.page.getByRole("button", { name: /^adjust order$/i }).click();

  //   // Wait for the Adjust Order modal.
  //   const dialog = this.page.getByRole("dialog");
  //   await expect(dialog).toBeVisible();

  //   // Click Add Item inside the modal.
  //   const addItemButton = dialog.locator("button", { hasText: "Add item" });
  //   await expect(addItemButton).toBeVisible();
  //   await expect(addItemButton).toBeEnabled();

  //   await addItemButton.click();
  //   await this.page.waitForTimeout(2000);

  //   // Add the first product (first "Add" button in the list).
  //   await this.page.getByRole("button", { name: /^add$/i }).first().click();
  //   await this.page.waitForTimeout(2000);

  //   // Done
  //   await this.page
  //     .locator('button[name="adjust-order"]', { hasText: /^done$/i })
  //     .click();

  //   // Adjust Order (submit)
  //   await this.page.getByRole("button", { name: /^adjust order$/i }).click();
  //   await this.page.waitForLoadState("networkidle");
  // }

  // ---- Update Status ----
  async updateStatusToPreparing(): Promise<void> {
    await this.page.getByRole("button", { name: /^update status$/i }).click();

    const dialog = this.page.getByRole("dialog");
    await expect(dialog.getByText("Select Status")).toBeVisible();

    // Click the Open (popup) indicator to expand the list.
    await this.page.locator('input[placeholder="Select Status"]').click();

    // Options render in a body-level listbox.
    await this.page.getByRole("option", { name: /^preparing$/i }).click();

    // Update — wait until enabled (it's disabled until a new status is picked).
    const update = dialog.getByRole("button", { name: /^update$/i });
    await expect(update).toBeEnabled();
    await update.click();
    await this.page.waitForLoadState("networkidle");

    // Close the modal via the X icon in the title bar.
    await dialog.locator("h2 button").first().click();
  }

  // ---- Cancel Order ----
  async cancelOrder(): Promise<void> {
    await this.page.getByRole("button", { name: /^cancel$/i }).click();
    await this.page.waitForTimeout(2000);

    // Cancel modal opens.
    const dialog = this.page.getByRole("dialog");
    await expect(dialog.getByText(/log users/i)).toBeVisible();

    // Log Users → All (checkbox, name="All")
    await dialog.locator('input[name="All"]').check({ force: true });

    // Reason → Lyxa Late (radio, value="lyxa-late")
    await dialog
      .locator('input[name="reasonForCancel"][value="lyxa-late"]')
      .check({ force: true });
    await this.page.waitForTimeout(2000);
    // Endorse Order → Don't Endorse Loss
    await dialog
      .locator("label", { hasText: /don't endorse loss/i })
      .locator('input[type="radio"]')
      .check({ force: true });

    // Done (submit)
    await dialog.getByRole("button", { name: /^done$/i }).click();
    await this.page.waitForLoadState("networkidle");
  }

  // // ---- Switch tab + date filter (Delivered, Current Month) ----
  // async openDeliveredCurrentMonth(): Promise<void> {
  //   // Switch to the Delivered main tab.
  //   await this.page
  //     .getByRole("tab", { name: /^delivered$/i })
  //     .or(this.page.getByRole("button", { name: /^delivered$/i }))
  //     .first()
  //     .click();
  //   await this.page.waitForLoadState("networkidle");

  //   // Open the date filter and pick "Current Month".
  //     await this.page
  //       .locator('.MuiInputBase-root', { has: this.page.locator('input[name="allowedRange"]') })
  //       .locator('.MuiInputAdornment-root')
  //       .click();

  //         // Pick "Current Month" from the preset buttons.
  //     await this.page.getByRole('button', { name: /^current month$/i }).click();
  //     await this.page.waitForLoadState('networkidle');
  // }
    // ---- Switch tab + date filter (Delivered, Current Month) ----
// ---- Switch to Delivered + Current Month, then flag the first flaggable order ----
async openDeliveredCurrentMonth(): Promise<void> {
  // Switch to the Delivered tab.
  await this.page
    .getByRole('tab', { name: /^delivered$/i })
    .or(this.page.getByRole('button', { name: /^delivered$/i }))
    .first()
    .click();
  await this.page.waitForLoadState('networkidle');

  // Apply the "Current Month" filter.
  await this.page
    .locator('.MuiInputBase-root', { has: this.page.locator('input[name="allowedRange"]') })
    .locator('.MuiInputAdornment-root')
    .click();
  await this.page.getByRole('button', { name: /^current month$/i }).click();
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
}

/**
 * Walk the order rows: open each, check for a "Flag order" button.
 * If present → flag it and stop. If not → close and try the next row.
 */
async flagFirstFlaggableOrder(maxTries = 10): Promise<void> {
  for (let i = 0; i < maxTries; i++) {
    const orderButton = this.page
      .locator(`.MuiDataGrid-row[data-rowindex="${i}"]`)
      .locator('[data-field="order"] button');

    if (!(await orderButton.isVisible().catch(() => false))) {
      throw new Error(`No flaggable order found in the first ${i} rows`);
    }

    await orderButton.scrollIntoViewIfNeeded();
    await orderButton.click();

    // Wait for the order detail panel to actually load (the "Order #..." heading).
    await expect(this.page.getByText(/^order #\d+/i).first())
      .toBeVisible({ timeout: 15_000 });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500); // let the sidebar buttons render

    // Now check for the Flag order button.
    const flagBtn = this.page.getByRole('button', { name: /^flag order$/i });
    const hasFlag = await flagBtn.isVisible({ timeout: 6000 }).catch(() => false);

    if (hasFlag) {
      await this.doFlag(flagBtn);
      return;
    }

    // No Flag button — close and try the next row.
    await this.closeOrderDetail();
    await this.page.waitForTimeout(1500);
  }

  throw new Error(`No flaggable order found within ${maxTries} orders`);
}

// close the drawer (order detail panel) and wait for it to actually close before continuing.
private async closeOrderDetail(): Promise<void> {
  const closeBtn = this.page.getByRole('button', { name: 'Close Drawer' });

  await closeBtn.waitFor({ state: 'visible', timeout: 5000 });
  await closeBtn.click();

  // Make sure the drawer is actually closed before continuing
  await closeBtn.waitFor({ state: 'hidden', timeout: 5000 });
}

/** Fill and submit the Flag Order modal. */
private async doFlag(flagBtn: Locator): Promise<void> {
  await flagBtn.click();

  const dialog = this.page.getByRole('dialog');
  await expect(dialog.getByText(/flag order/i)).toBeVisible();

  await dialog.locator('input[name="User"]').check({ force: true });
  await dialog.locator('label', { hasText: /^wrong item$/i })
    .locator('input[type="radio"]').check({ force: true });
  await dialog.locator('label', { hasText: /^refund$/i })
    .locator('input[type="radio"]').check({ force: true });

await expect(dialog.getByText(/select item to refund/i)).toBeVisible();

// Click "Select all"
const selectAllRow = dialog
  .locator('h6', { hasText: /^select all$/i })  // ^...$ so it won't match "Unselect all"
  .first()                                       // the h6 is duplicated in the DOM
  .locator('..');                                // parent Box holding the checkbox

await selectAllRow.locator('input[type="checkbox"]').check({ force: true });

  // Random refund item — first real item checkbox. ⚠ verify index
  await dialog.locator('input[type="checkbox"]').nth(2).check({ force: true });

  const done = dialog.getByRole('button', { name: /^done$/i });
  await expect(done).toBeEnabled();
  await done.click();
  await this.page.getByRole('button', { name: 'Close Drawer' }).click();
  await this.page.waitForLoadState('networkidle');
  await this.page.keyboard.press('Escape');
}
}
