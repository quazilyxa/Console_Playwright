// import { expect, type Locator } from '@playwright/test';
// import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
// import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
// import { TabBar } from '@/consoles/admin/components/TabBar';

// export type TeamRole =
//   | 'Super Admin'
//   | 'General Manager'
//   | 'Order Management Lead'
//   | 'Order Management Agent'
//   | 'Fleet Manager'
//   | 'Account Manager'
//   | 'Account Manager Lead'
//   | 'Business Development Executive'
//   | 'Accounting'
//   | 'Marketing Manager'
//   | 'Marketing Coordinator';

// export interface MemberData {
//   name: string;
//   email: string;
//   phone: string;
//   password: string;
//   role: TeamRole;
// }

// export const ROLES: TeamRole[] = [
//   'Super Admin',
//   'General Manager',
//   'Order Management Lead',
//   'Order Management Agent',
//   'Fleet Manager',
//   'Account Manager',
//   'Account Manager Lead',
//   'Business Development Executive',
//   'Accounting',
//   'Marketing Manager',
//   'Marketing Coordinator',
// ];

// /**
//  * TeamPage — Super Admin "Team" section.
//  *
//  * Members are grouped by role tab.
//  *
//  * Main flows:
//  * - Select role
//  * - Add member
//  * - Search member
//  * - Edit member
//  * - Change member status
//  * - Filter by status
//  * - Delete member
//  */
// export class TeamPage extends AdminBasePage {
//   readonly path = AdminRoutes.team;

//   /**
//    * The Team page does not have a heading named "Team".
//    * The heading represents the currently selected role,
//    * e.g. "Super Admin", "General Manager", etc.
//    */
//   protected readonly heading =
//     /Super Admin|General Manager|Order Management Lead|Order Management Agent|Fleet Manager|Account Manager|Account Manager Lead|Business Development Executive|Accounting|Marketing Manager|Marketing Coordinator/;

//   private readonly tabs = new TabBar(this.page);

//   /** All role tabs available in the Team section. */
//   static readonly roles = ROLES;

//   // ==========================================================
//   // Locators
//   // ==========================================================

//   private get addMemberButton(): Locator {
//     return this.page.getByRole('button', { name: 'Add Member' });
//   }

//   private get searchInput(): Locator {
//     return this.page.locator('input[name="searchValue"]');
//   }

//   private get formStatusInput(): Locator {
//     return this.page.locator(
//       `xpath=//h6[normalize-space()='Status *']/following::input[@id='input-autocomplete-status'][1]`,
//     );
//   }

//   private get filterStatusInput(): Locator {
//     return this.page.locator(
//       '#input-autocomplete-status[placeholder="Status"]',
//     );
//   }

//   // ==========================================================
//   // Navigation / Tabs
//   // ==========================================================

//   async openTab(name: string): Promise<void> {
//     await this.tabs.select(name);
//   }

//   async selectRole(role: TeamRole): Promise<void> {
//     console.log(`→ Selecting Team role: ${role}`);

//     await this.tabs.select(role);
//     await this.waitForList();

//     console.log(`✓ Team role selected: ${role}`);
//   }

//   // ==========================================================
//   // Test Data
//   // ==========================================================

//   static randomMember(overrides: Partial<MemberData> = {}): MemberData {
//     const stamp = Date.now().toString().slice(-8);

//     return {
//       name: `AT-Member-${stamp}`,
//       email: `at.member.${stamp}@mailinator.com`,
//       phone: `754${1000 + Math.floor(Math.random() * 9000)}`,
//       password: 'Test123@',
//       role: ROLES[Math.floor(Math.random() * ROLES.length)],
//       ...overrides,
//     };
//   }

//   // ==========================================================
//   // Create Member
//   // ==========================================================

//   async createMember(
//     overrides: Partial<MemberData> = {},
//   ): Promise<MemberData> {
//     const data = TeamPage.randomMember(overrides);

//     console.log(`→ Creating Team member: ${data.name}`);
//     console.log(`→ Role: ${data.role}`);

//     await this.selectRole(data.role);

//     console.log('→ Clicking Add Member...');
//     await this.addMemberButton.click();

//     await expect(
//       this.page.getByRole('heading', { name: 'Add Member' }),
//     ).toBeVisible();

//     console.log('✓ Add Member form opened');

//     await this.page
//       .locator('input[name="name"]')
//       .fill(data.name);

//     await this.page
//       .locator('input[name="email"]')
//       .fill(data.email);

//     await this.page
//       .locator('input[name="phoneNumber"]')
//       .fill(data.phone);

//     await this.page
//       .locator('input[name="password"]')
//       .fill(data.password);

//     await this.page
//       .locator('input[name="confirmPassword"]')
//       .fill(data.password);

//     console.log('✓ Member form filled');

//     await this.page
//       .getByRole('button', { name: 'Add User' })
//       .click();

//     console.log('✓ Add User clicked');

//     await this.waitForList();

//     console.log(`✓ Member created: ${data.name}`);

//     return data;
//   }

//   // ==========================================================
//   // Search
//   // ==========================================================

//   async searchMember(name: string): Promise<void> {
//     console.log(`→ Searching for member: ${name}`);

//     await this.searchInput.click();
//     await this.searchInput.fill(name);

//     await this.waitForList();

//     await expect(
//       this.page.getByText(name, { exact: true }).first(),
//     ).toBeVisible();

//     console.log(`✓ Member found: ${name}`);
//   }

//   // ==========================================================
//   // Row Actions
//   // ==========================================================

//   private async openRowActions(name: string): Promise<void> {
//     // Locate the rider in the rendered table
//     const riderLink = this.page.getByRole('link', {
//       name,
//       exact: true,
//     });

//     // Wait until search results have rendered
//     await expect(riderLink).toBeVisible({ timeout: 15000 });

//     const row = riderLink.locator(
//       'xpath=ancestor::*[@role="row"][1]'
//     );

//     await expect(row).toBeVisible({ timeout: 10000 });

//     // Find the action button in THIS row
//     const actionButton = row.locator(
//       'button:has(svg.iconify--heroicons-solid)'
//     ).last();

//     await expect(actionButton).toBeVisible({ timeout: 10000 });

//     // Make sure the button is actually in the viewport
//     await actionButton.scrollIntoViewIfNeeded();

//     // Move mouse to the button first
//     await actionButton.hover();

//     // Click
//     await actionButton.click();

//     // Verify menu opened
//     await expect(
//       this.page.getByRole('menuitem', { name: 'Edit', exact: true })
//     ).toBeVisible({ timeout: 5000 });
//   }

//   // ==========================================================
//   // Edit / Status
//   // ==========================================================

//   async setStatus(
//     name: string,
//     status: 'Active' | 'Inactive',
//   ): Promise<void> {
//     console.log(`→ Changing status for ${name} to ${status}`);

//     await this.searchMember(name);

//     await this.openRowActions(name);

//     console.log('→ Clicking Edit...');

//     await this.page
//       .getByRole('menuitem', { name: 'Edit' })
//       .click();

//     console.log('✓ Edit form opened');

//     await this.selectAutocompleteLocator(
//       this.formStatusInput,
//       status,
//     );

//     console.log(`✓ Status selected: ${status}`);

//     await this.page
//       .getByRole('button', { name: 'Save Changes' })
//       .click();

//     console.log('✓ Save Changes clicked');

//     await this.waitForList();

//     console.log(`✓ Member status updated to ${status}`);
//   }

//   // ==========================================================
//   // Status Filter
//   // ==========================================================

//   async filterByStatus(
//     status: 'Active' | 'Inactive',
//   ): Promise<void> {
//     console.log(`→ Filtering members by status: ${status}`);

//     await this.selectAutocompleteLocator(
//       this.filterStatusInput,
//       status,
//     );

//     await this.waitForList();

//     console.log(`✓ Status filter applied: ${status}`);
//   }

//   // ==========================================================
//   // Delete
//   // ==========================================================

//   async deleteMember(name: string): Promise<void> {
//     console.log(`→ Deleting member: ${name}`);

//     await this.searchMember(name);

//     await this.openRowActions(name);

//     console.log('→ Clicking Delete...');

//     await this.page
//       .getByRole('menuitem', { name: 'Delete' })
//       .click();

//     const confirmDialog = this.page.getByRole('dialog');

//     await expect(confirmDialog).toBeVisible();

//     console.log('✓ Delete confirmation dialog opened');

//     const confirmButton = confirmDialog.getByRole('button', {
//       name: /delete|confirm|yes/i,
//     });

//     await expect(confirmButton).toBeVisible();

//     await confirmButton.click();

//     console.log('✓ Delete confirmed');

//     await expect(confirmDialog).toBeHidden();

//     await this.waitForList();

//     await this.clearSearch();

//     console.log(`✓ Member deleted: ${name}`);
//   }

//   // ==========================================================
//   // Clear Search
//   // ==========================================================

//   async clearSearch(): Promise<void> {
//     console.log('→ Clearing member search...');

//     await this.searchInput.click();
//     await this.searchInput.fill('');

//     await this.waitForList();

//     console.log('✓ Search cleared');
//   }

//   // ==========================================================
//   // Assertions
//   // ==========================================================

//   async expectMemberVisible(name: string): Promise<void> {
//     await expect(
//       this.page.getByText(name, { exact: true }).first(),
//     ).toBeVisible();
//   }

//   async expectMemberGone(name: string): Promise<void> {
//     await expect(
//       this.page.getByText(name, { exact: true }),
//     ).toHaveCount(0);
//   }

//   // ==========================================================
//   // Autocomplete
//   // ==========================================================

//   private async selectAutocompleteLocator(
//     input: Locator,
//     option?: string,
//   ): Promise<void> {
//     await input.click();

//     const listbox = this.page.getByRole('listbox');

//     await expect(listbox).toBeVisible();

//     if (option) {
//       await listbox
//         .getByRole('option', {
//           name: option,
//           exact: true,
//         })
//         .click();
//     } else {
//       const options = listbox.getByRole('option');

//       const count = await options.count();

//       expect(
//         count,
//         'listbox has no options to choose from',
//       ).toBeGreaterThan(0);

//       const randomIndex = Math.floor(
//         Math.random() * count,
//       );

//       await options.nth(randomIndex).click();
//     }

//     if (await listbox.isVisible().catch(() => false)) {
//       await this.page.keyboard.press('Escape');
//     }

//     await expect(listbox).toBeHidden();
//   }

//   // ==========================================================
//   // List Loading
//   // ==========================================================

//   private async waitForList(): Promise<void> {
//     await this.page.waitForLoadState('networkidle');

//     await this.page.waitForTimeout(2000);

//     await expect(
//       this.page.getByRole('progressbar'),
//     ).toHaveCount(0);
//   }
// }

import { expect, type Locator } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { TabBar } from '@/consoles/admin/components/TabBar';

export type TeamRole =
  | 'Super Admin'
  | 'General Manager'
  | 'Order Management Lead'
  | 'Order Management Agent'
  | 'Fleet Manager'
  | 'Account Manager'
  | 'Account Manager Lead'
  | 'Business Development Executive'
  | 'Accounting'
  | 'Marketing Manager'
  | 'Marketing Coordinator';

export interface MemberData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: TeamRole;
}

export const ROLES: TeamRole[] = [
  'Super Admin',
  'General Manager',
  'Order Management Lead',
  'Order Management Agent',
  'Fleet Manager',
  'Account Manager',
  'Account Manager Lead',
  'Business Development Executive',
  'Accounting',
  'Marketing Manager',
  'Marketing Coordinator',
];

/**
 * TeamPage — Super Admin "Team" section.
 *
 * Members are grouped by role tab.
 *
 * Main flows:
 * - Select role
 * - Add member
 * - Search member
 * - Edit member
 * - Change member status
 * - Filter by status
 * - Delete member
 */
export class TeamPage extends AdminBasePage {
  readonly path = AdminRoutes.team;

  /**
   * The Team page does not have a heading named "Team".
   * The heading represents the currently selected role,
   * e.g. "Super Admin", "General Manager", etc.
   */
  protected readonly heading =
    /Super Admin|General Manager|Order Management Lead|Order Management Agent|Fleet Manager|Account Manager|Account Manager Lead|Business Development Executive|Accounting|Marketing Manager|Marketing Coordinator/;

  private readonly tabs = new TabBar(this.page);

  /** All role tabs available in the Team section. */
  static readonly roles = ROLES;

  // ==========================================================
  // Locators
  // ==========================================================

  private get addMemberButton(): Locator {
    return this.page.getByRole('button', {
      name: 'Add Member',
      exact: true,
    });
  }

  private get searchInput(): Locator {
    return this.page.locator('input[name="searchValue"]');
  }

  private get formStatusInput(): Locator {
    return this.page.locator(
      `xpath=//h6[normalize-space()='Status *']/following::input[@id='input-autocomplete-status'][1]`,
    );
  }

  private get filterStatusInput(): Locator {
    return this.page.locator(
      '#input-autocomplete-status[placeholder="Status"]',
    );
  }

  // ==========================================================
  // Navigation / Tabs
  // ==========================================================

  async openTab(name: string): Promise<void> {
    await this.tabs.select(name);
  }

  async selectRole(role: TeamRole): Promise<void> {
    console.log(`→ Selecting Team role: ${role}`);

    await this.tabs.select(role);
    await this.waitForList();

    console.log(`✓ Team role selected: ${role}`);
  }

  // ==========================================================
  // Test Data
  // ==========================================================

  static randomMember(
    overrides: Partial<MemberData> = {},
  ): MemberData {
    const stamp = Date.now().toString().slice(-8);

    return {
      name: `AT-Member-${stamp}`,
      email: `at.member.${stamp}@mailinator.com`,
      phone: `754${1000 + Math.floor(Math.random() * 9000)}`,
      password: 'Test123@',
      role: ROLES[Math.floor(Math.random() * ROLES.length)],
      ...overrides,
    };
  }

  // ==========================================================
  // Create Member
  // ==========================================================

  async createMember(
    overrides: Partial<MemberData> = {},
  ): Promise<MemberData> {
    const data = TeamPage.randomMember(overrides);

    console.log(`→ Creating Team member: ${data.name}`);
    console.log(`→ Role: ${data.role}`);

    await this.selectRole(data.role);

    console.log('→ Clicking Add Member...');

    await expect(this.addMemberButton).toBeVisible({
      timeout: 10000,
    });

    await this.addMemberButton.click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Add Member',
        exact: true,
      }),
    ).toBeVisible({
      timeout: 10000,
    });

    console.log('✓ Add Member form opened');

    await this.page
      .locator('input[name="name"]')
      .fill(data.name);

    await this.page
      .locator('input[name="email"]')
      .fill(data.email);

    await this.page
      .locator('input[name="phoneNumber"]')
      .fill(data.phone);

    await this.page
      .locator('input[name="password"]')
      .fill(data.password);

    await this.page
      .locator('input[name="confirmPassword"]')
      .fill(data.password);

    console.log('✓ Member form filled');

    await this.page
      .getByRole('button', {
        name: 'Add User',
        exact: true,
      })
      .click();

    console.log('✓ Add User clicked');

    await this.waitForList();

    console.log(`✓ Member created: ${data.name}`);

    return data;
  }

  // ==========================================================
  // Search
  // ==========================================================

  async searchMember(name: string): Promise<void> {
    console.log(`→ Searching for member: ${name}`);

    await expect(this.searchInput).toBeVisible({
      timeout: 10000,
    });

    await this.searchInput.click();

    await this.searchInput.fill(name);

    await this.waitForList();

    /*
     * Team member names are rendered as normal text.
     * They are NOT links, so do not use getByRole('link').
     */
    const member = this.page
      .getByText(name, {
        exact: true,
      })
      .first();

    await expect(member).toBeVisible({
      timeout: 15000,
    });

    console.log(`✓ Member found: ${name}`);
  }

  // ==========================================================
  // Row Actions
  // ==========================================================

private async openRowActions(name: string): Promise<void> {
  console.log(`→ Opening actions for member: ${name}`);

  // Find the exact DataGrid row containing this member
  const row = this.page
    .getByRole('row')
    .filter({
      has: this.page.getByText(name, { exact: true }),
    })
    .first();

  await expect(row).toBeVisible({ timeout: 15000 });

  console.log(`✓ Member row found: ${name}`);

  // Locate the actions cell inside THIS row
  const actionsCell = row.locator(
    '[role="gridcell"][data-field="actions"]',
  );

  await expect(actionsCell).toBeVisible({ timeout: 10000 });

  // Locate the button inside the actions cell
  const actionButton = actionsCell.locator('button').first();

  await expect(actionButton).toBeVisible({ timeout: 10000 });

  await actionButton.scrollIntoViewIfNeeded();

  // Let any trailing re-render/layout settle before interacting.
  // (Avoids clicking a node that's about to be unmounted/remounted
  // right after a search/filter re-render.)
  await this.page.waitForTimeout(300);

  console.log('→ Hovering and clicking 3-dot action button...');

  await actionButton.hover();
  await actionButton.click();

  console.log('✓ 3-dot action button clicked');

  // Verify the action menu actually opened
  const editMenuItem = this.page.getByRole('menuitem', {
    name: 'Edit',
    exact: true,
  });

  try {
    await expect(editMenuItem).toBeVisible({ timeout: 5000 });
  } catch (err) {
    // Diagnostic fallback: menu didn't open on the first click.
    // Retry once with a forced click in case something is
    // intercepting pointer events (ripple/backdrop/overlay).
    console.log(
      '⚠ Edit menu item not visible after click — retrying with force click...',
    );

    await actionButton.click({ force: true });

    await expect(editMenuItem).toBeVisible({ timeout: 5000 });
  }

  console.log('✓ Actions menu opened');
}
  // ==========================================================
  // Edit / Status
  // ==========================================================

  async setStatus(
    name: string,
    status: 'Active' | 'Inactive',
  ): Promise<void> {
    console.log(
      `→ Changing status for ${name} to ${status}`,
    );

    /*
     * Search first.
     */
    await this.searchMember(name);

    /*
     * Open the row's 3-dot menu.
     */
    await this.openRowActions(name);

    console.log('→ Clicking Edit...');

    await this.page
      .getByRole('menuitem', {
        name: 'Edit',
        exact: true,
      })
      .click();

    console.log('✓ Edit form opened');

    /*
     * Select status from the form autocomplete.
     */
    await this.selectAutocompleteLocator(
      this.formStatusInput,
      status,
    );

    console.log(`✓ Status selected: ${status}`);

    await this.page
      .getByRole('button', {
        name: 'Save Changes',
        exact: true,
      })
      .click();

    console.log('✓ Save Changes clicked');

    await this.waitForList();

    console.log(
      `✓ Member status updated to ${status}`,
    );
  }

  // ==========================================================
  // Status Filter
  // ==========================================================

  async filterByStatus(
    status: 'Active' | 'Inactive',
  ): Promise<void> {
    console.log(
      `→ Filtering members by status: ${status}`,
    );

    const input = this.filterStatusInput;

    await expect(input).toBeVisible({
      timeout: 10000,
    });

    await input.click();

    const listbox = this.page.getByRole('listbox');

    await expect(listbox).toBeVisible({
      timeout: 5000,
    });

    const option = listbox.getByRole('option', {
      name: status,
      exact: true,
    });

    await expect(option).toBeVisible({
      timeout: 5000,
    });

    await option.click();

    /*
     * Verify that the selected value is actually applied.
     */
    await expect(input).toHaveValue(status);

    /*
     * Close autocomplete if it remains open.
     */
    if (await listbox.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape');
    }

    await this.waitForList();

    console.log(
      `✓ Status filter applied: ${status}`,
    );
  }

  // ==========================================================
  // Delete
  // ==========================================================

  async deleteMember(name: string): Promise<void> {
    console.log(`→ Deleting member: ${name}`);

    /*
     * Search for the member.
     */
    await this.searchMember(name);

    /*
     * Open the 3-dot menu for this exact row.
     */
    await this.openRowActions(name);

    console.log('→ Clicking Delete...');

    await this.page
      .getByRole('menuitem', {
        name: 'Delete',
        exact: true,
      })
      .click();

    /*
     * Wait for confirmation dialog.
     */
    const confirmDialog = this.page.getByRole('dialog');

    await expect(confirmDialog).toBeVisible({
      timeout: 5000,
    });

    console.log(
      '✓ Delete confirmation dialog opened',
    );

    /*
     * Find the confirmation button inside the dialog.
     */
    const confirmButton = confirmDialog.getByRole(
      'button',
      {
        name: /delete|confirm|yes/i,
      },
    );

    await expect(confirmButton).toBeVisible({
      timeout: 5000,
    });

    await confirmButton.click();

    console.log('✓ Delete confirmed');

    await expect(confirmDialog).toBeHidden({
      timeout: 10000,
    });

    await this.waitForList();

    /*
     * Clear the search after deletion.
     */
    await this.clearSearch();

    console.log(`✓ Member deleted: ${name}`);
  }

  // ==========================================================
  // Clear Search
  // ==========================================================

  async clearSearch(): Promise<void> {
    console.log('→ Clearing member search...');

    await expect(this.searchInput).toBeVisible({
      timeout: 10000,
    });

    await this.searchInput.click();

    await this.searchInput.fill('');

    await this.waitForList();

    console.log('✓ Search cleared');
  }

  // ==========================================================
  // Assertions
  // ==========================================================

  async expectMemberVisible(
    name: string,
  ): Promise<void> {
    const member = this.page
      .getByText(name, {
        exact: true,
      })
      .first();

    await expect(member).toBeVisible({
      timeout: 15000,
    });
  }

  async expectMemberGone(
    name: string,
  ): Promise<void> {
    await expect(
      this.page.getByText(name, {
        exact: true,
      }),
    ).toHaveCount(0);
  }

  // ==========================================================
  // Autocomplete
  // ==========================================================

  private async selectAutocompleteLocator(
    input: Locator,
    option?: string,
  ): Promise<void> {
    await expect(input).toBeVisible({
      timeout: 10000,
    });

    await input.click();

    const listbox = this.page.getByRole('listbox');

    await expect(listbox).toBeVisible({
      timeout: 5000,
    });

    if (option) {
      const optionLocator = listbox.getByRole(
        'option',
        {
          name: option,
          exact: true,
        },
      );

      await expect(optionLocator).toBeVisible({
        timeout: 5000,
      });

      await optionLocator.click();
    } else {
      const options = listbox.getByRole('option');

      const count = await options.count();

      expect(
        count,
        'listbox has no options to choose from',
      ).toBeGreaterThan(0);

      const randomIndex = Math.floor(
        Math.random() * count,
      );

      await options
        .nth(randomIndex)
        .click();
    }

    /*
     * Close the dropdown if MUI keeps it open.
     */
    if (await listbox.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape');
    }

    await expect(listbox).toBeHidden({
      timeout: 5000,
    });
  }

  // ==========================================================
  // List Loading
  // ==========================================================

  private async waitForList(): Promise<void> {
    await this.page.waitForLoadState('networkidle');

    /*
     * Keep the existing small rendering buffer because the
     * table appears to update after the network request.
     */
    await this.page.waitForTimeout(2000);

    await expect(
      this.page.getByRole('progressbar'),
    ).toHaveCount(0);
  }
}