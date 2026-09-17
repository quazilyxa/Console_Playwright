// // import { expect, type Locator } from '@playwright/test';
// // import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
// // import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
// // import { AdminSelectors } from '../selectors/admin.selectors';

// // const TAG_PHOTO_PATH =
// //   process.env.TAG_PHOTO_PATH ??
// //   'C:\\Users\\quazi\\Downloads\\abc.jpg';

// // export interface TagData {
// //   name: string;
// //   type: 'Food' | 'Grocery' | 'Coffee' | 'Pets' | 'Flowers' | 'Beauty' | 'Wellness';
// // }

// // export class TagsPage extends AdminBasePage {
// //   readonly path = AdminRoutes.tags;
// //   protected readonly heading = AdminSelectors.headings.tags;

// //   // ==========================================================
// //   // Locators
// //   // ==========================================================

// //   private get addButton(): Locator {
// //     return this.page
// //       .locator('button[type="button"]')
// //       .filter({ hasText: /^Add$/ })
// //       .first();
// //   }

// //   private get nameInput(): Locator {
// //     return this.page.locator('input[name="name"]');
// //   }

// //   private get searchInput(): Locator {
// //     return this.page.locator('input[name="searchValue"]');
// //   }

// //   /**
// //    * Three-dot action button.
// //    * The exact SVG class is taken from the provided HTML.
// //    */
// //   private get kebab(): Locator {
// //     return this.page
// //       .locator('button:has(svg.iconify--heroicons-solid)')
// //       .last();
// //   }

// //   // ==========================================================
// //   // Navigation
// //   // ==========================================================

// // async gotoTags(): Promise<void> {
// //   const tab = this.page.getByRole('tab', { name: 'Tags' });

// //   await expect(tab).toBeVisible();
// //   await tab.click();

// //   // Confirm MUI actually flipped the selected state
// //   await expect(tab).toHaveAttribute('aria-selected', 'true');

// //   await expect(
// //     this.page.getByRole('heading', { name: this.heading })
// //   ).toBeVisible();

// //   await this.waitForList();
// // }
// //   // ==========================================================
// //   // Test Data
// //   // ==========================================================

// //   static randomTag(
// //     overrides: Partial<TagData> = {}
// //   ): TagData {
// //     const stamp = Date.now().toString().slice(-8);

// //     return {
// //       name: `AT-Tag-${stamp}`,
// //       type: 'Food',
// //       ...overrides,
// //     };
// //   }

// //   // ==========================================================
// //   // Create
// //   // ==========================================================

// //   async createTag(
// //     overrides: Partial<TagData> = {}
// //   ): Promise<TagData> {
// //     const data = TagsPage.randomTag(overrides);

// //     // Open Add Tag drawer
// //     await expect(this.addButton).toBeVisible();
// //     await this.addButton.click();

// //     await expect(
// //       this.page.getByRole('heading', { name: 'Add Tag' })
// //     ).toBeVisible();

// //     // Name
// //     await expect(this.nameInput).toBeVisible();
// //     await this.nameInput.fill(data.name);

// //     // Type
// //     await this.selectType(data.type);

// //     // Upload photo
// //     await this.uploadImage(TAG_PHOTO_PATH);

// //     // Submit
// //     const submitButton = this.page
// //       .locator('button[type="submit"]')
// //       .filter({ hasText: /^Add$/ });

// //     await expect(submitButton).toBeVisible();
// //     await submitButton.click();

// //     await this.waitForList();

// //     return data;
// //   }

// //   // ==========================================================
// //   // Photo Upload
// //   // ==========================================================

// // private async uploadImage(filePath: string): Promise<void> {
// //   const log = (msg: string, data?: unknown) =>
// //     console.log(`[uploadImage] ${msg}`, data ?? '');

// //   // Surface any browser-side console errors/warnings during this flow
// //   const consoleListener = (msg: import('@playwright/test').ConsoleMessage) => {
// //     if (msg.type() === 'error' || msg.type() === 'warning') {
// //       log(`PAGE CONSOLE [${msg.type()}]`, msg.text());
// //     }
// //   };
// //   this.page.on('console', consoleListener);

// //   try {
// //     // 1. How many dropzones exist right now?
// //     const allDropzones = this.page.locator(
// //       'div[role="presentation"]:has(> input[type="file"][accept="image/*"])',
// //     );
// //     const count = await allDropzones.count();
// //     log(`Found ${count} dropzone(s) matching selector`);

// //     if (count === 0) {
// //       log('ERROR: No dropzone found at all — selector or DOM structure is wrong');
// //       await this.page.screenshot({ path: 'debug-no-dropzone.png', fullPage: true });
// //       throw new Error('No dropzone element found');
// //     }
// //     if (count > 1) {
// //       log('WARNING: Multiple dropzones found — .first() may grab the wrong one');
// //       for (let i = 0; i < count; i++) {
// //         const box = await allDropzones.nth(i).boundingBox();
// //         const visible = await allDropzones.nth(i).isVisible();
// //         log(`  dropzone[${i}] visible=${visible} box=${JSON.stringify(box)}`);
// //       }
// //     }

// //     const dropzone = allDropzones.first();
// //     await expect(dropzone).toBeVisible();
// //     log('Dropzone[0] confirmed visible');

// //     const dzBox = await dropzone.boundingBox();
// //     log('Dropzone bounding box', dzBox);

// //     // 2. Check the actual <input type=file> before touching it
// //     const fileInput = dropzone.locator('input[type="file"][accept="image/*"]');
// //     const inputCount = await fileInput.count();
// //     log(`File input count inside dropzone: ${inputCount}`);

// //     const inputAttached = await fileInput.first().isVisible().catch(() => false);
// //     log(`Input reports isVisible()=${inputAttached} (expected false — it's visually hidden by CSS, that's normal)`);

// //     // 3. Verify the file actually exists on disk before setInputFiles
// //     const fs = await import('fs');
// //     const fileExists = fs.existsSync(filePath);
// //     log(`Local file exists at "${filePath}": ${fileExists}`);
// //     if (!fileExists) {
// //       throw new Error(`Upload file not found on disk: ${filePath}`);
// //     }

// //     // 4. Set the file directly on the input (bypassing native file dialog)
// //     log('Calling setInputFiles on hidden input...');
// //     await fileInput.first().setInputFiles(filePath);
// //     log('setInputFiles resolved without throwing');

// //     // 5. Give the app a beat to process the file (preview render, upload start, etc.)
// //     await this.page.waitForTimeout(500);

// //     // 6. Check for any visible error/toast immediately after selecting the file
// //     const errorToast = this.page.getByRole('alert');
// //     const toastCount = await errorToast.count();
// //     if (toastCount > 0) {
// //       const toastText = await errorToast.first().innerText().catch(() => '(could not read)');
// //       log(`Toast/alert appeared after file select: "${toastText}"`);
// //     }

// //     // 7. Look for the Finish button — log whether it ever appears
// //     const finishButton = this.page.getByRole('button', { name: /^finish$/i });
// //     log('Waiting for Finish button to appear...');

// //     const finishAppeared = await finishButton
// //       .waitFor({ state: 'visible', timeout: 10000 })
// //       .then(() => true)
// //       .catch((err) => {
// //         log('Finish button did NOT appear within 10s', err.message);
// //         return false;
// //       });

// //     if (!finishAppeared) {
// //       await this.page.screenshot({ path: 'debug-no-finish-button.png', fullPage: true });
// //       // Dump what buttons ARE visible, to see if the label/text differs
// //       const allButtons = await this.page.getByRole('button').allInnerTexts();
// //       log('All visible button labels on page right now:', allButtons);
// //       throw new Error('Finish button never appeared after file selection');
// //     }

// //     log('Finish button visible — clicking');
// //     await finishButton.click();

// //     const finishHidden = await finishButton
// //       .waitFor({ state: 'hidden', timeout: 10000 })
// //       .then(() => true)
// //       .catch((err) => {
// //         log('Finish button did NOT hide after click', err.message);
// //         return false;
// //       });

// //     if (!finishHidden) {
// //       await this.page.screenshot({ path: 'debug-finish-not-hidden.png', fullPage: true });
// //       throw new Error('Finish button stayed visible after click — click may not have registered');
// //     }

// //     log('Finish button hidden — upload step complete, waiting for network idle');
// //     await this.page.waitForLoadState('networkidle');
// //     await this.page.waitForTimeout(1500);
// //     log('uploadImage() finished successfully');
// //   } catch (err) {
// //     log('FATAL ERROR in uploadImage', (err as Error).message);
// //     await this.page.screenshot({ path: `debug-upload-failure-${Date.now()}.png`, fullPage: true });
// //     throw err;
// //   } finally {
// //     this.page.off('console', consoleListener);
// //   }
// // }
// //   // ==========================================================
// //   // Type
// //   // ==========================================================

// //   private async selectType(
// //     type: TagData['type']
// //   ): Promise<void> {
// //     const combo = this.page.locator(
// //       'xpath=//label[normalize-space()="Type" or normalize-space()="Type *"]' +
// //       '/following::*[@role="combobox"][1]'
// //     );

// //     await expect(combo).toBeVisible();
// //     await combo.click();

// //     const listbox = this.page.getByRole('listbox');

// //     await expect(listbox).toBeVisible();

// //     await listbox
// //       .getByRole('option', {
// //         name: type,
// //         exact: true,
// //       })
// //       .click();

// //     await expect(listbox).toBeHidden();
// //   }

// //   // ==========================================================
// //   // Search
// //   // ==========================================================

// //   async searchTag(name: string): Promise<void> {
// //     if (!name) {
// //       throw new Error('Tag name is required for search');
// //     }

// //     await this.searchInput.click();
// //     await this.searchInput.fill(name);

// //     await this.waitForList();

// //     await expect(
// //       this.page.getByText(name, { exact: true }).first()
// //     ).toBeVisible();
// //   }

// //   // ==========================================================
// //   // Open Kebab
// //   // ==========================================================

// //   private async openKebab(): Promise<void> {
// //     await expect(this.kebab).toBeVisible();
// //     await this.kebab.click();

// //     await expect(
// //       this.page.getByRole('menu')
// //     ).toBeVisible();
// //   }

// //   // ==========================================================
// //   // Update
// //   // ==========================================================

// //   async updateTag(
// //     name: string,
// //     newName: string
// //   ): Promise<void> {
// //     await this.searchTag(name);

// //     await this.openKebab();

// //     await this.page
// //       .getByRole('menuitem', { name: 'Edit' })
// //       .click();

// //     // Wait for edit drawer
// //     await expect(
// //       this.page.getByRole('heading', { name: /Edit Tag/i })
// //     ).toBeVisible();

// //     // Update name
// //     await this.nameInput.fill(newName);

// //     // Save
// //     const saveButton = this.page.getByRole('button', {
// //       name: /Save Changes|Save/i,
// //     });

// //     await expect(saveButton).toBeVisible();
// //     await saveButton.click();

// //     await this.waitForList();

// //     // Remove search filter
// //     await this.clearSearch();
// //   }

// //   // ==========================================================
// //   // Delete
// //   // ==========================================================

// //   async deleteTag(name: string): Promise<void> {
// //     await this.searchTag(name);

// //     await this.openKebab();

// //     await this.page
// //       .getByRole('menuitem', { name: 'Delete' })
// //       .click();

// //     const confirmDialog = this.page.getByRole('dialog');

// //     await expect(confirmDialog).toBeVisible();

// //     const deleteButton = confirmDialog.getByRole('button', {
// //       name: /^Delete$/i,
// //     });

// //     await expect(deleteButton).toBeVisible();

// //     await deleteButton.click();

// //     await expect(confirmDialog).toBeHidden();

// //     await this.waitForList();

// //     await this.clearSearch();
// //   }

// //   // ==========================================================
// //   // Clear Search
// //   // ==========================================================

// //   async clearSearch(): Promise<void> {
// //     await this.searchInput.click();
// //     await this.searchInput.fill('');

// //     await this.waitForList();
// //   }

// //   // ==========================================================
// //   // Assertions
// //   // ==========================================================

// //   async expectTagVisible(name: string): Promise<void> {
// //     await expect(
// //       this.page.getByText(name, { exact: true }).first()
// //     ).toBeVisible();
// //   }

// //   async expectTagGone(name: string): Promise<void> {
// //     await expect(
// //       this.page.getByText(name, { exact: true })
// //     ).toHaveCount(0);
// //   }

// //   // ==========================================================
// //   // Wait
// //   // ==========================================================

// //   private async waitForList(): Promise<void> {
// //     await this.page.waitForLoadState('networkidle');
// //     await this.page.waitForTimeout(2000);

// //     await expect(
// //       this.page.getByRole('progressbar')
// //     ).toHaveCount(0);
// //   }
// // }

// import { expect, type Locator } from '@playwright/test';
// import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
// import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
// import { AdminSelectors } from '../selectors/admin.selectors';
// import time from 'node:timers/promises';

// const TAG_PHOTO_PATH =
//   process.env.TAG_PHOTO_PATH ??
//   'C:\\Users\\quazi\\Downloads\\abc.jpg';

// const log = (scope: string, msg: string, data?: unknown) =>
//   console.log(`[${scope}] ${msg}`, data ?? '');

// export interface TagData {
//   name: string;
//   type: 'Food' | 'Grocery' | 'Coffee' | 'Pets' | 'Flowers' | 'Beauty' | 'Wellness';
// }

// export class TagsPage extends AdminBasePage {
//   readonly path = AdminRoutes.tags;
//   protected readonly heading = AdminSelectors.headings.tags;

//   // ==========================================================
//   // Locators
//   // ==========================================================

//   private get addButton(): Locator {
//     return this.page
//       .locator('button[type="button"]')
//       .filter({ hasText: /^Add$/ })
//       .first();
//   }

//   private get nameInput(): Locator {
//     return this.page.locator('input[name="name"]');
//   }

//   private get searchInput(): Locator {
//     return this.page.locator('input[name="searchValue"]');
//   }

//   private get kebab(): Locator {
//     return this.page
//       .locator('button:has(svg.iconify--heroicons-solid)')
//       .last();
//   }

//   // ==========================================================
//   // Navigation
//   // ==========================================================

//   async gotoTags(): Promise<void> {
//     log('gotoTags', 'START');

//     const tab = this.page.getByRole('tab', { name: 'Tags' });

//     log('gotoTags', 'Waiting for Tags tab to be visible...');
//     await expect(tab).toBeVisible();
//     log('gotoTags', 'Tags tab visible — clicking');
//     await tab.click();

//     log('gotoTags', 'Asserting aria-selected="true"...');
//     await expect(tab).toHaveAttribute('aria-selected', 'true');
//     log('gotoTags', 'Tab confirmed selected');

//     log('gotoTags', `Waiting for heading "${this.heading}"...`);
//     await expect(
//       this.page.getByRole('heading', { name: this.heading })
//     ).toBeVisible();
//     log('gotoTags', 'Heading visible');

//     await this.waitForList();
//     log('gotoTags', 'DONE');
//   }

//   // ==========================================================
//   // Test Data
//   // ==========================================================

//   static randomTag(overrides: Partial<TagData> = {}): TagData {
//     const stamp = Date.now().toString().slice(-8);

//     return {
//       name: `AT-Tag-${stamp}`,
//       type: 'Food',
//       ...overrides,
//     };
//   }


// async createTag(overrides: Partial<TagData> = {}): Promise<TagData> {
//   log('createTag', 'START', overrides);
//   const data = TagsPage.randomTag(overrides);

//   await expect(this.addButton).toBeVisible();
//   await this.addButton.click();

//   await expect(this.page.getByRole('heading', { name: 'Add Tag' })).toBeVisible();

//   await expect(this.nameInput).toBeVisible();
//   log('createTag', `Filling name: ${data.name}`);
//   await this.nameInput.fill(data.name);
//   await this.nameInput.press('Tab');
//   await expect(this.nameInput).toHaveValue(data.name);
//   log('createTag', 'Name confirmed');

//   log('createTag', 'Starting image upload...');
//   await this.uploadImage(TAG_PHOTO_PATH);
//   log('createTag', 'Image upload complete');

//   await this.page.waitForTimeout(1000); // Wait for 1 second to ensure the image upload is processed

//   const submitButton = this.page
//     .locator('button[type="submit"]')
//     .filter({ hasText: /^Add$/ });

//   log('createTag', 'Waiting for submit button...');
//   await expect(submitButton).toBeVisible();
//   log('createTag', 'Clicking Add...');
//   await submitButton.click();

//   log('createTag', 'Waiting for list to refresh...');
//   await this.waitForList();

//   log('createTag', 'DONE', data);
//   return data;
// }

//   // ==========================================================
//   // Photo Upload
//   // ==========================================================

//   private async uploadImage(filePath: string): Promise<void> {
//   const scope = 'uploadImage';
//   log(scope, 'START', filePath);

//   // The dropzone wraps a hidden <input type="file" accept="image/*">
//   const dropzone = this.page.locator(
//     'div.mnl__upload div[role="presentation"]:has(> input[type="file"][accept="image/*"])'
//   ).first();

//   await expect(dropzone).toBeVisible();
//   log(scope, 'Dropzone found');

//   const fileInput = dropzone.locator('input[type="file"][accept="image/*"]');
//   const fs = await import('fs');
//   if (!fs.existsSync(filePath)) {
//     throw new Error(`File not found: ${filePath}`);
//   }

//   log(scope, 'Setting file on hidden input directly...');
//   await fileInput.setInputFiles(filePath);
//   log(scope, 'File set — waiting for app to process it');

//   await this.page.waitForTimeout(500);

//   // If there's a crop/confirm step, handle it; otherwise this section is skipped
//   const finishButton = this.page.getByRole('button', { name: /^finish$/i });
//   const finishVisible = await finishButton.isVisible().catch(() => false);
//   log(scope, `Finish button visible: ${finishVisible}`);

//   if (finishVisible) {
//     await finishButton.click();
//     await expect(finishButton).toBeHidden();
//     log(scope, 'Finish clicked and closed');
//   } else {
//     log(scope, 'No Finish button appeared — assuming direct upload with no crop step');
//   }

//   await this.page.waitForLoadState('networkidle');
//   await this.page.waitForTimeout(1000);
//   log(scope, 'DONE');
// }


//   // ==========================================================
//   // Search
//   // ==========================================================

//   async searchTag(name: string): Promise<void> {
//     const scope = 'searchTag';
//     log(scope, `START name=${name}`);

//     if (!name) {
//       throw new Error('Tag name is required for search');
//     }

//     await this.searchInput.click();
//     log(scope, 'Search input clicked — filling value');
//     await this.searchInput.fill(name);

//     await this.waitForList();

//     log(scope, `Verifying "${name}" is visible in results...`);
//     await expect(
//       this.page.getByText(name, { exact: true }).first()
//     ).toBeVisible();
//     log(scope, 'DONE');
//   }

//   // ==========================================================
//   // Open Kebab
//   // ==========================================================

//   private async openKebab(): Promise<void> {
//     const scope = 'openKebab';
//     log(scope, 'START');

//     log(scope, 'Waiting for kebab button...');
//     await expect(this.kebab).toBeVisible();
//     log(scope, 'Kebab visible — clicking');
//     await this.kebab.click();

//     log(scope, 'Waiting for menu to appear...');
//     await expect(this.page.getByRole('menu')).toBeVisible();
//     log(scope, 'DONE');
//   }

 
//   // ==========================================================
//   // Delete
//   // ==========================================================

//   async deleteTag(name: string): Promise<void> {
//     const scope = 'deleteTag';
//     log(scope, `START name=${name}`);

//     await this.searchTag(name);
//     await this.openKebab();

//     log(scope, 'Clicking Delete menu item...');
//     await this.page.getByRole('menuitem', { name: 'Delete' }).click();

//     const confirmDialog = this.page.getByRole('dialog');

//     log(scope, 'Waiting for confirm dialog...');
//     await expect(confirmDialog).toBeVisible();
//     log(scope, 'Confirm dialog visible');

//     const deleteButton = confirmDialog.getByRole('button', { name: /^Delete$/i });

//     log(scope, 'Waiting for confirm Delete button...');
//     await expect(deleteButton).toBeVisible();
//     log(scope, 'Clicking confirm Delete...');
//     await deleteButton.click();

//     log(scope, 'Waiting for dialog to close...');
//     await expect(confirmDialog).toBeHidden();
//     log(scope, 'Dialog closed');

//     await this.waitForList();
//     log(scope, 'Clearing search filter...');
//     await this.clearSearch();
//     log(scope, 'DONE');
//   }

//   // ==========================================================
//   // Clear Search
//   // ==========================================================

//   async clearSearch(): Promise<void> {
//     const scope = 'clearSearch';
//     log(scope, 'START');

//     await this.searchInput.click();
//     await this.searchInput.fill('');

//     await this.waitForList();
//     log(scope, 'DONE');
//   }

//   // ==========================================================
//   // Assertions
//   // ==========================================================

//     // async expectTagVisible(name: string): Promise<void> {
//     // const scope = 'expectTagVisible';
//     // log(scope, `Checking "${name}" is visible via search...`);

//     // await this.searchTag(name); // fills search, waits for list, asserts visibility

//     // log(scope, 'CONFIRMED');

//     // // Reset search so the page is back to its default state for whatever runs next
//     // await this.clearSearch();
//     // }

//     async expectTagGone(name: string): Promise<void> {
//     const scope = 'expectTagGone';
//     log(scope, `Checking "${name}" is gone via search...`);

//     await this.searchInput.click();
//     await this.searchInput.fill(name);
//     await this.waitForList();

//     await expect(
//         this.page.getByText(name, { exact: true })
//     ).toHaveCount(0);

//     log(scope, 'CONFIRMED');

//     await this.clearSearch();
//     }
//   // ==========================================================
//   // Wait
//   // ==========================================================

//   private async waitForList(): Promise<void> {
//     const scope = 'waitForList';
//     log(scope, 'Waiting for network idle...');
//     await this.page.waitForLoadState('networkidle');
//     await this.page.waitForTimeout(2000);

//     log(scope, 'Checking progressbar count is 0...');
//     await expect(this.page.getByRole('progressbar')).toHaveCount(0);
//     log(scope, 'DONE');
//   }
// }
import { expect, type Locator } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '../selectors/admin.selectors';

const TAG_PHOTO_PATH =
  process.env.TAG_PHOTO_PATH ?? 'C:\\Users\\quazi\\Downloads\\abc.jpg';

const CONTAINER_IMAGE_PATH =
  process.env.CONTAINER_IMAGE_PATH ?? 'C:\\Users\\quazi\\Downloads\\abc.jpg';

const BANNER_IMAGE_PATH =
  process.env.BANNER_IMAGE_PATH ?? 'C:\\Users\\quazi\\Downloads\\abc.jpg';

const log = (scope: string, msg: string, data?: unknown) =>
  console.log(`[${scope}] ${msg}`, data ?? '');

export interface TagData {
  name: string;
  type:
    | 'Food'
    | 'Grocery'
    | 'Coffee'
    | 'Pets'
    | 'Flowers'
    | 'Beauty'
    | 'Wellness';
}

export interface ListContainerData {
  name: string;
  zone: string;
  deal: string;
  tag: string;
  restaurant: string;
}

export class TagsPage extends AdminBasePage {
  readonly path = AdminRoutes.tags;
  protected readonly heading = AdminSelectors.headings.tags;

  // ==========================================================
  // Shared Locators (used by both Tags & List Containers)
  // ==========================================================

  private get addButton(): Locator {
    return this.page
      .locator('button[type="button"]')
      .filter({ hasText: /^Add$/ })
      .first();
  }

  private get nameInput(): Locator {
    return this.page.locator('input[name="name"]');
  }

  private get searchInput(): Locator {
    return this.page.locator('input[name="searchValue"]');
  }

  private get kebab(): Locator {
    return this.page
      .locator('button:has(svg.iconify--heroicons-solid)')
      .last();
  }

  // ==========================================================
  // Navigation — Tags
  // ==========================================================

  async gotoTags(): Promise<void> {
    log('gotoTags', 'START');

    const tab = this.page.getByRole('tab', { name: 'Tags' });

    log('gotoTags', 'Waiting for Tags tab to be visible...');
    await expect(tab).toBeVisible();
    log('gotoTags', 'Tags tab visible — clicking');
    await tab.click();

    log('gotoTags', 'Asserting aria-selected="true"...');
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    log('gotoTags', 'Tab confirmed selected');

    log('gotoTags', `Waiting for heading "${this.heading}"...`);
    await expect(
      this.page.getByRole('heading', { name: this.heading })
    ).toBeVisible();
    log('gotoTags', 'Heading visible');

    await this.waitForList();
    log('gotoTags', 'DONE');
  }

  // ==========================================================
  // Test Data — Tags
  // ==========================================================

  static randomTag(overrides: Partial<TagData> = {}): TagData {
    const stamp = Date.now().toString().slice(-8);

    return {
      name: `AT-Tag-${stamp}`,
      type: 'Food',
      ...overrides,
    };
  }

  // ==========================================================
  // Create — Tags
  // ==========================================================

  async createTag(overrides: Partial<TagData> = {}): Promise<TagData> {
    log('createTag', 'START', overrides);
    const data = TagsPage.randomTag(overrides);

    await expect(this.addButton).toBeVisible();
    await this.addButton.click();

    await expect(
      this.page.getByRole('heading', { name: 'Add Tag' })
    ).toBeVisible();

    await expect(this.nameInput).toBeVisible();
    log('createTag', `Filling name: ${data.name}`);
    await this.nameInput.fill(data.name);
    await this.nameInput.press('Tab');
    await expect(this.nameInput).toHaveValue(data.name);
    log('createTag', 'Name confirmed');

    // log('createTag', `Selecting type: ${data.type}`);
    // await this.selectType(data.type);
    // log('createTag', 'Type selected');

    log('createTag', 'Starting image upload...');
    await this.uploadImage(TAG_PHOTO_PATH);
    log('createTag', 'Image upload complete');

    await this.page.waitForTimeout(1000);

    const submitButton = this.page
      .locator('button[type="submit"]')
      .filter({ hasText: /^Add$/ });

    log('createTag', 'Waiting for submit button...');
    await expect(submitButton).toBeVisible();
    log('createTag', 'Clicking Add...');
    await submitButton.click();

    log('createTag', 'Waiting for list to refresh...');
    await this.waitForList();

    log('createTag', 'DONE', data);
    return data;
  }

  // ==========================================================
  // Photo Upload — Tags (single dropzone, no label needed)
  // ==========================================================

  private async uploadImage(filePath: string): Promise<void> {
    const scope = 'uploadImage';
    log(scope, 'START', filePath);

    const dropzone = this.page
      .locator(
        'div.mnl__upload div[role="presentation"]:has(> input[type="file"][accept="image/*"])'
      )
      .first();

    await expect(dropzone).toBeVisible();
    log(scope, 'Dropzone found');

    const fileInput = dropzone.locator(
      'input[type="file"][accept="image/*"]'
    );
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    log(scope, 'Setting file on hidden input directly...');
    await fileInput.setInputFiles(filePath);
    log(scope, 'File set — waiting for app to process it');

    await this.page.waitForTimeout(500);

    const finishButton = this.page.getByRole('button', { name: /^finish$/i });
    const finishVisible = await finishButton.isVisible().catch(() => false);
    log(scope, `Finish button visible: ${finishVisible}`);

    if (finishVisible) {
      await finishButton.click();
      await expect(finishButton).toBeHidden();
      log(scope, 'Finish clicked and closed');
    } else {
      log(scope, 'No Finish button appeared — assuming direct upload');
    }

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    log(scope, 'DONE');
  }

  // ==========================================================
  // Type — Tags
  // ==========================================================

  private async selectType(type: TagData['type']): Promise<void> {
    const combo = this.page.locator(
      'xpath=//label[normalize-space()="Type" or normalize-space()="Type *"]' +
        '/following::*[@role="combobox"][1]'
    );

    await expect(combo).toBeVisible();
    await combo.click();

    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    await listbox.getByRole('option', { name: type, exact: true }).click();
    await expect(listbox).toBeHidden();
  }

  // ==========================================================
  // Search — Tags
  // ==========================================================

  async searchTag(name: string): Promise<void> {
    const scope = 'searchTag';
    log(scope, `START name=${name}`);

    if (!name) {
      throw new Error('Tag name is required for search');
    }

    await this.searchInput.click();
    log(scope, 'Search input clicked — filling value');
    await this.searchInput.fill(name);

    await this.waitForList();

    log(scope, `Verifying "${name}" is visible in results...`);
    await expect(
      this.page.getByText(name, { exact: true }).first()
    ).toBeVisible();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Open Kebab (shared)
  // ==========================================================

  private async openKebab(): Promise<void> {
    const scope = 'openKebab';
    log(scope, 'START');

    log(scope, 'Waiting for kebab button...');
    await expect(this.kebab).toBeVisible();
    log(scope, 'Kebab visible — clicking');
    await this.kebab.click();

    log(scope, 'Waiting for menu to appear...');
    await expect(this.page.getByRole('menu')).toBeVisible();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Update — Tags
  // ==========================================================

  async updateTag(name: string, newName: string): Promise<void> {
    const scope = 'updateTag';
    log(scope, `START name=${name} -> newName=${newName}`);

    await this.searchTag(name);
    await this.openKebab();

    log(scope, 'Clicking Edit menu item...');
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();

    log(scope, 'Waiting for "Edit Tag" drawer heading...');
    await expect(
      this.page.getByRole('heading', { name: /Edit Tag/i })
    ).toBeVisible();
    log(scope, 'Edit drawer opened');

    log(scope, `Filling new name: ${newName}`);
    await this.nameInput.click();
    await this.nameInput.fill('');
    await this.nameInput.fill(newName);
    await this.nameInput.press('Tab');

    await expect(this.nameInput).toHaveValue(newName);
    log(scope, 'New name confirmed in field');

    const saveButton = this.page.getByRole('button', {
      name: /Save Changes|Save/i,
    });

    log(scope, 'Waiting for Save button...');
    await expect(saveButton).toBeVisible();
    log(scope, 'Save button visible — clicking');
    await saveButton.click();

    await this.waitForList();
    log(scope, 'Clearing search filter...');
    await this.clearSearch();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Delete — Tags
  // ==========================================================

  async deleteTag(name: string): Promise<void> {
    const scope = 'deleteTag';
    log(scope, `START name=${name}`);

    await this.searchTag(name);
    await this.openKebab();

    log(scope, 'Clicking Delete menu item...');
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();

    const confirmDialog = this.page.getByRole('dialog');

    log(scope, 'Waiting for confirm dialog...');
    await expect(confirmDialog).toBeVisible();
    log(scope, 'Confirm dialog visible');

    const deleteButton = confirmDialog.getByRole('button', {
      name: /^Delete$/i,
    });

    log(scope, 'Waiting for confirm Delete button...');
    await expect(deleteButton).toBeVisible();
    log(scope, 'Clicking confirm Delete...');
    await deleteButton.click();

    log(scope, 'Waiting for dialog to close...');
    await expect(confirmDialog).toBeHidden();
    log(scope, 'Dialog closed');

    await this.waitForList();
    log(scope, 'Clearing search filter...');
    await this.clearSearch();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Clear Search (shared)
  // ==========================================================

  async clearSearch(): Promise<void> {
    const scope = 'clearSearch';
    log(scope, 'START');

    await this.searchInput.click();
    await this.searchInput.fill('');

    await this.waitForList();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Assertions — Tags
  // ==========================================================

  async expectTagVisible(name: string): Promise<void> {
    const scope = 'expectTagVisible';
    log(scope, `Checking "${name}" is visible via search...`);

    await this.searchTag(name);

    log(scope, 'CONFIRMED');
    await this.clearSearch();
  }

  async expectTagGone(name: string): Promise<void> {
    const scope = 'expectTagGone';
    log(scope, `Checking "${name}" is gone via search...`);

    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.waitForList();

    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);

    log(scope, 'CONFIRMED');
    await this.clearSearch();
  }

  // ==========================================================
  // ==========================================================
  // LIST CONTAINERS
  // ==========================================================
  // ==========================================================

  // ==========================================================
  // Navigation — List Containers
  // ==========================================================

  async gotoListContainers(): Promise<void> {
    const scope = 'gotoListContainers';
    log(scope, 'START');

    const tab = this.page.getByRole('tab', { name: 'List Containers' });

    log(scope, 'Waiting for List Containers tab...');
    await expect(tab).toBeVisible();
    log(scope, 'Tab visible — clicking');
    await tab.click();

    log(scope, 'Asserting aria-selected="true"...');
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    log(scope, 'Tab confirmed selected');

    log(scope, 'Waiting for "List Containers" heading...');
    await expect(
      this.page.getByRole('heading', { name: /List Containers/i })
    ).toBeVisible();
    log(scope, 'Heading visible');

    await this.waitForList();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Test Data — List Containers
  // ==========================================================

  static randomContainerName(): string {
    const stamp = Date.now().toString().slice(-8);
    return `AT-Container-${stamp}`;
  }

  // ==========================================================
  // Create — List Containers
  // ==========================================================

  async createListContainer(): Promise<ListContainerData> {
    const scope = 'createListContainer';
    log(scope, 'START');

    const name = TagsPage.randomContainerName();

    log(scope, 'Waiting for Add button...');
    await expect(this.addButton).toBeVisible();
    log(scope, 'Add button visible — clicking');
    await this.addButton.click();

    log(scope, 'Waiting for "Add List Container" heading...');
    await expect(
      this.page.getByRole('heading', { name: 'Add List Container' })
    ).toBeVisible();
    log(scope, 'Drawer opened');

    log(scope, `Filling name: ${name}`);
    await expect(this.nameInput).toBeVisible();
    await this.nameInput.fill(name);
    await this.nameInput.press('Tab');
    await expect(this.nameInput).toHaveValue(name);
    log(scope, 'Name confirmed');

    log(scope, 'Selecting random Zone...');
    const zone = await this.selectRandomFromMultiSelect('Zones');

    log(scope, 'Selecting random Deal...');
    const deal = await this.selectRandomFromMultiSelect('Deals');

    log(scope, 'Selecting random Tag...');
    const tag = await this.selectRandomFromMultiSelect('Tags');

    log(scope, 'Selecting random Restaurant...');
    const restaurant = await this.selectRandomFromMultiSelect('Restaurants');

    log(scope, 'Uploading Container Image...');
    await this.uploadImageByIndex(0, 'Container Image', CONTAINER_IMAGE_PATH);

    log(scope, 'Uploading Banner Image...');
    await this.uploadImageByIndex(1, 'Banner Image', BANNER_IMAGE_PATH);

    const submitButton = this.page
      .locator('button[type="submit"]')
      .filter({ hasText: /^Add$/ });

    log(scope, 'Waiting for submit button...');
    await expect(submitButton).toBeVisible();
    log(scope, 'Clicking Add...');
    await submitButton.click();

    log(scope, 'Waiting for list to refresh...');
    await this.waitForList();

    const data: ListContainerData = { name, zone, deal, tag, restaurant };
    log(scope, 'DONE', data);
    return data;
  }

  
  private async selectRandomFromMultiSelect(
  labelText: string
): Promise<string> {
  const scope = `selectRandomFromMultiSelect(${labelText})`;
  log(scope, 'START');

  // Input has placeholder="Select Zones" / "Select Deals" / "Select Tags" / "Select Restaurants"
  const input = this.page.locator(
    `input[role="combobox"][placeholder="Select ${labelText}"]`
  );

  log(scope, 'Waiting for input...');
  await expect(input).toBeVisible();
  log(scope, 'Input found — clicking to focus');

  await input.click();

  const listbox = this.page.getByRole('listbox');
  let opened = await listbox.isVisible().catch(() => false);
  log(scope, `Listbox opened after click: ${opened}`);

  if (!opened) {
    log(scope, 'Click did not open dropdown — pressing ArrowDown');
    await input.press('ArrowDown');
    opened = await listbox
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    log(scope, `Listbox opened after ArrowDown: ${opened}`);
  }

  if (!opened) {
    await this.page.screenshot({
      path: `debug-dropdown-${labelText}.png`,
      fullPage: true,
    });
    throw new Error(`Could not open dropdown for "${labelText}"`);
  }

  const options = listbox.getByRole('option');
  const count = await options.count();
  log(scope, `Found ${count} option(s)`);

  if (count === 0) {
    throw new Error(`No options available for "${labelText}"`);
  }

  const randomIndex = Math.floor(Math.random() * count);
  const chosenOption = options.nth(randomIndex);
  const chosenText = (await chosenOption.innerText()).trim();

  log(scope, `Selecting option[${randomIndex}]: "${chosenText}"`);
  await chosenOption.click();

  // Close dropdown after picking (Autocomplete usually needs Escape to fully close)
  await this.page.keyboard.press('Escape');
  await expect(listbox).toBeHidden();

  log(scope, 'DONE', chosenText);
  return chosenText;
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
  log(scope, `Dropzone[${index}] confirmed visible`);

  const fileInput = dropzone.locator('input[type="file"][accept="image/*"]');
  const fs = await import('fs');
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  log(scope, 'Setting file on hidden input...');
  await fileInput.setInputFiles(filePath);
  log(scope, 'File set — waiting for app to process');

  await this.page.waitForTimeout(500);

  const finishButton = this.page.getByRole('button', { name: /^finish$/i });
  const finishVisible = await finishButton.isVisible().catch(() => false);
  log(scope, `Finish button visible: ${finishVisible}`);

  if (finishVisible) {
    await finishButton.click();
    await expect(finishButton).toBeHidden();
    log(scope, 'Finish clicked and closed');
  } else {
    log(scope, 'No Finish button — direct upload assumed');
  }

  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(1000);
  log(scope, 'DONE');
}

  // ==========================================================
  // Search — List Containers
  // ==========================================================

  async searchListContainer(name: string): Promise<void> {
    const scope = 'searchListContainer';
    log(scope, `START name=${name}`);

    if (!name) {
      throw new Error('Container name is required for search');
    }

    await this.searchInput.click();
    await this.searchInput.fill(name);

    await this.waitForList();

    log(scope, `Verifying "${name}" is visible...`);
    await expect(
      this.page.getByText(name, { exact: true }).first()
    ).toBeVisible();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Delete — List Containers
  // ==========================================================

  async deleteListContainer(name: string): Promise<void> {
    const scope = 'deleteListContainer';
    log(scope, `START name=${name}`);

    await this.searchListContainer(name);
    await this.openKebab();

    log(scope, 'Clicking Delete menu item...');
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();

    const confirmDialog = this.page.getByRole('dialog');
    log(scope, 'Waiting for confirm dialog...');
    await expect(confirmDialog).toBeVisible();

    const deleteButton = confirmDialog.getByRole('button', {
      name: /^Delete$/i,
    });

    await expect(deleteButton).toBeVisible();
    log(scope, 'Clicking confirm Delete...');
    await deleteButton.click();

    log(scope, 'Waiting for dialog to close...');
    await expect(confirmDialog).toBeHidden();

    await this.waitForList();
    log(scope, 'Clearing search filter...');
    await this.clearSearch();
    log(scope, 'DONE');
  }

  // ==========================================================
  // Assertions — List Containers
  // ==========================================================

  async expectListContainerGone(name: string): Promise<void> {
    const scope = 'expectListContainerGone';
    log(scope, `Checking "${name}" is gone...`);

    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.waitForList();

    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);

    log(scope, 'CONFIRMED');
    await this.clearSearch();
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






// ==========================================================
// Filter Containers — Navigation & Shuffle
// ==========================================================

async gotoFilterContainers(): Promise<void> {
  const scope = 'gotoFilterContainers';
  log(scope, 'START');

  const tab = this.page.getByRole('tab', { name: 'Filter Containers' });
  await expect(tab).toBeVisible();
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');

  await expect(
    this.page.getByRole('heading', { name: /Global Filter Slider/i })
  ).toBeVisible();

  await this.waitForList();
  log(scope, 'DONE');
}

async shuffleFirstTwoFilterContainers(): Promise<void> {
  const scope = 'shuffleFirstTwoFilterContainers';
  log(scope, 'START');

  // Run once if the swap doesn't visibly work, to find the right row-text selector:
  // await this.debugInspectDragHandleAncestors(scope);

  await this.dragReorderFirstItemDown(scope);

  await this.waitForList();
  log(scope, 'DONE');
}

// ==========================================================
// User App Sections — Navigation & Shuffle
// ==========================================================

async gotoUserAppSections(): Promise<void> {
  const scope = 'gotoUserAppSections';
  log(scope, 'START');

  const tab = this.page.getByText('User App Sections', { exact: true });
  await expect(tab).toBeVisible();
  await tab.click();

  await expect(
    this.page.getByRole('heading', { name: /User App Sections/i })
  ).toBeVisible();

  await this.waitForList();
  log(scope, 'DONE');
}

async shuffleFirstTwoUserAppSections(): Promise<void> {
  const scope = 'shuffleFirstTwoUserAppSections';
  log(scope, 'START');

  // Run once if the swap doesn't visibly work, to find the right row-text selector:
  // await this.debugInspectDragHandleAncestors(scope);

  await this.dragReorderFirstItemDown(scope);

  await this.waitForList();
  log(scope, 'DONE');
}
private async debugInspectDragHandleAncestors(
  scopeLabel: string
): Promise<void> {
  const scope = scopeLabel;
  const handle = this.page.locator('button[aria-label="Drag handle"]').first();
  await expect(handle).toBeVisible();

  const levels = await handle.evaluate((el) => {
    const results: string[] = [];
    let node: HTMLElement | null = el as HTMLElement;
    for (let i = 0; i < 6 && node; i++) {
      results.push(
        `Level ${i}: <${node.tagName.toLowerCase()} class="${node.className}"> text="${node.textContent
          ?.trim()
          .slice(0, 120)}"`
      );
      node = node.parentElement;
    }
    return results;
  });

  levels.forEach((l) => log(scope, l));
}

// ==========================================================
// Drag & Drop Reorder (dnd-kit keyboard sensor)
// ==========================================================

private async dragReorderFirstItemDown(scopeLabel: string): Promise<void> {
  const scope = scopeLabel;
  log(scope, 'START');

  const dragHandles = this.page.locator('button[aria-label="Drag handle"]');
  const count = await dragHandles.count();
  log(scope, `Found ${count} drag handle(s)`);

  if (count < 2) {
    throw new Error(
      `Need at least 2 sortable items to shuffle, found ${count}`
    );
  }

  const firstHandle = dragHandles.first();
  await expect(firstHandle).toBeVisible();

  log(scope, 'Focusing first drag handle...');
  await firstHandle.focus();

  log(scope, 'Pressing Space to pick up item...');
  await firstHandle.press('Space');
  await this.page.waitForTimeout(300);

  log(scope, 'Pressing ArrowDown to swap with next item...');
  await firstHandle.press('ArrowDown');
  await this.page.waitForTimeout(300);

  log(scope, 'Pressing Space to drop item...');
  await firstHandle.press('Space');
  await this.page.waitForTimeout(800);

  log(scope, 'DONE');
}
}
