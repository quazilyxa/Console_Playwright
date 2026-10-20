import { expect, type Locator } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';

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
  roles: TeamRole[];
  /** Single role alias for backward compatibility */
  role?: TeamRole;
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

export const NON_SUPER_ADMIN_ROLES: TeamRole[] = ROLES.filter(
  (r) => r !== 'Super Admin',
);

/**
 * TeamPage — Super Admin "Team" section.
 *
 * Updated for the new UI:
 * - Page heading: "Team"
 * - Roles selected inside the "Add Member" modal form via autocomplete
 * - Table toolbar with Search, Roles combobox, and Status combobox
 * - Row action menu (Edit / Delete) via 3-dot button
 */
export class TeamPage extends AdminBasePage {
  readonly path = AdminRoutes.team;

  /** Heading text/regex used to confirm the page loaded */
  protected readonly heading = AdminSelectors.headings.team;

  /** All role tabs available in the Team section */
  static readonly roles = ROLES;
  static readonly nonSuperAdminRoles = NON_SUPER_ADMIN_ROLES;

  // ==========================================================
  // Locators
  // ==========================================================

  private get modal(): Locator {
    return this.page.getByRole('region', { name: 'scrollable content' });
  }

  private get formRolesInput(): Locator {
    return this.modal
      .locator('#input-autocomplete-roles')
      .or(this.page.locator('#input-autocomplete-roles:not([placeholder="Roles"])'))
      .first();
  }

  private get formStatusInput(): Locator {
    return this.modal
      .locator('#input-autocomplete-status')
      .or(this.page.locator('#input-autocomplete-status:not([placeholder="Status"])'))
      .first();
  }

  private get addMemberButton(): Locator {
    return this.page.getByRole('button', { name: 'Add Member', exact: true });
  }

  private get searchInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Search...' });
  }

  private get statusFilter(): Locator {
    return this.page
      .locator('#input-autocomplete-status[placeholder="Status"]')
      .or(this.page.getByPlaceholder('Status'))
      .or(this.page.getByRole('combobox', { name: 'Status' }))
      .first();
  }

  private get rolesFilter(): Locator {
    return this.page
      .locator('#input-autocomplete-roles[placeholder="Roles"]')
      .or(this.page.getByPlaceholder('Roles'))
      .or(this.page.getByRole('combobox', { name: 'Roles' }))
      .first();
  }

  // ==========================================================
  // Navigation / Tabs (Compatibility)
  // ==========================================================

  async selectRole(role: TeamRole): Promise<void> {
    await this.filterByRole(role);
  }

  async openTab(name: string): Promise<void> {
    if (ROLES.includes(name as TeamRole)) {
      await this.filterByRole(name as TeamRole);
    }
  }

  // ==========================================================
  // Test Data
  // ==========================================================

  static randomMember(overrides: Partial<MemberData> = {}): MemberData {
    const stamp = Date.now().toString().slice(-8);

    const defaultRoles: TeamRole[] = overrides.roles
      ? overrides.roles
      : overrides.role
        ? [overrides.role]
        : ['General Manager', 'Marketing Manager', 'Order Management Lead'];

    return {
      name: `AT-Member-${stamp}`,
      email: `at.member.${stamp}@mailinator.com`,
      phone: `754${1000 + Math.floor(Math.random() * 9000)}`,
      password: 'Test123@',
      roles: defaultRoles,
      role: defaultRoles[0],
      ...overrides,
    };
  }

  // ==========================================================
  // Create Member
  // ==========================================================

  async createMember(overrides: Partial<MemberData> = {}): Promise<MemberData> {
    const data = TeamPage.randomMember(overrides);

    console.log(
      `→ Creating Team member: ${data.name} (Roles: ${data.roles.join(', ')})`,
    );

    // If an Add Member drawer was left open from a previous failed attempt, close it
    const existingSubmit = this.page.getByRole('button', {
      name: 'Add User',
      exact: true,
    });
    if (await existingSubmit.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape');
      await expect(existingSubmit).toBeHidden({ timeout: 3000 }).catch(() => {});
    }

    await expect(this.addMemberButton).toBeVisible({ timeout: 10000 });
    await this.addMemberButton.click();

    // Verify Add Member / Add User form modal is open
    await expect(
      this.page.getByRole('button', { name: 'Add User', exact: true }),
    ).toBeVisible({ timeout: 10000 });

    // Fill member form fields
    await this.page.getByRole('textbox', { name: 'Name *' }).fill(data.name);
    await this.page.getByRole('textbox', { name: 'Email *' }).fill(data.email);
    await this.page.getByRole('textbox', { name: 'Phone Number *' }).fill(data.phone);

    // Select role(s) inside the modal autocomplete (scoped to form)
    await this.formRolesInput.click();
    for (const role of data.roles) {
      const roleOption = this.page.getByRole('option', {
        name: role,
        exact: true,
      });
      await expect(roleOption).toBeVisible({ timeout: 5000 });
      await roleOption.click();
    }

    // Close the autocomplete popup if still open
    const listbox = this.page.getByRole('listbox');
    if (await listbox.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape');
    }

    // Fill passwords
    await this.page.getByRole('textbox', { name: 'Password *', exact: true }).fill(data.password);
    await this.page.getByRole('textbox', { name: 'Confirm Password *' }).fill(data.password);

    // Submit form
    await this.page.getByRole('button', { name: 'Add User', exact: true }).click();

    await this.waitForList();
    console.log(`✓ Member created: ${data.name}`);

    return data;
  }

  // ==========================================================
  // Search
  // ==========================================================

  async searchMember(name: string): Promise<void> {
    console.log(`→ Searching for member: ${name}`);

    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchInput.fill(name);

    await this.waitForList();

    const member = this.page.getByText(name, { exact: true }).first();
    await expect(member).toBeVisible({ timeout: 15000 });

    console.log(`✓ Member found: ${name}`);
  }

  async clearSearch(): Promise<void> {
    console.log('→ Clearing member search...');
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchInput.fill('');
    await this.waitForList();
    console.log('✓ Search cleared');
  }

  // ==========================================================
  // Row Actions (3-dot menu)
  // ==========================================================

  private async openRowActions(name: string): Promise<void> {
    console.log(`→ Opening actions for member: ${name}`);

    const row = this.page
      .getByRole('row')
      .filter({ has: this.page.getByText(name, { exact: true }) })
      .first();

    await expect(row).toBeVisible({ timeout: 15000 });

    // The 3-dot action button in the row
    const actionButton = row.getByRole('gridcell').last().getByRole('button');
    await expect(actionButton).toBeVisible({ timeout: 10000 });
    await actionButton.scrollIntoViewIfNeeded();

    await actionButton.click();

    // Verify the menu opened
    const editItem = this.page.getByRole('menuitem', { name: 'Edit', exact: true });
    try {
      await expect(editItem).toBeVisible({ timeout: 4000 });
    } catch {
      await actionButton.click({ force: true });
      await expect(editItem).toBeVisible({ timeout: 5000 });
    }

    console.log('✓ Actions menu opened');
  }

  // ==========================================================
  // Edit / Status
  // ==========================================================

  async setStatus(name: string, status: 'Active' | 'Inactive'): Promise<void> {
    console.log(`→ Changing status for ${name} to ${status}`);

    await this.searchMember(name);
    await this.openRowActions(name);

    await this.page.getByRole('menuitem', { name: 'Edit', exact: true }).click();

    // Select status inside the Edit form autocomplete
    await this.formStatusInput.click();
    await this.page.getByRole('option', { name: status, exact: true }).click();

    const listbox = this.page.getByRole('listbox');
    if (await listbox.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape');
    }

    await this.page.getByRole('button', { name: 'Save Changes', exact: true }).click();

    await this.waitForList();
    console.log(`✓ Member status updated to ${status}`);
  }

  // ==========================================================
  // Status Filter (Toolbar)
  // ==========================================================

  async filterByStatus(status: 'Active' | 'Inactive'): Promise<void> {
    console.log(`→ Filtering members by status: ${status}`);

    await expect(this.statusFilter).toBeVisible({ timeout: 10000 });
    await this.statusFilter.click();

    const option = this.page.getByRole('option', { name: status, exact: true });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();

    await this.waitForList();
    console.log(`✓ Status filter applied: ${status}`);
  }

  // ==========================================================
  // Role Filter (Toolbar)
  // ==========================================================

  async filterByRole(role: TeamRole): Promise<void> {
    console.log(`→ Filtering members by role: ${role}`);

    await expect(this.rolesFilter).toBeVisible({ timeout: 10000 });
    await this.rolesFilter.click();

    const option = this.page.getByRole('option', { name: role, exact: true });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    await this.page.keyboard.press('Escape');

    await this.waitForList();
    console.log(`✓ Role filter applied: ${role}`);
  }

  // ==========================================================
  // Delete Member
  // ==========================================================

  async deleteMember(name: string): Promise<void> {
    console.log(`→ Deleting member: ${name}`);

    await this.searchMember(name);
    await this.openRowActions(name);

    await this.page.getByRole('menuitem', { name: 'Delete', exact: true }).click();

    // Wait for confirmation dialog
    const confirmButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: /delete|confirm|yes/i });

    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    await this.waitForList();
    await this.clearSearch();

    console.log(`✓ Member deleted: ${name}`);
  }

  // ==========================================================
  // Assertions
  // ==========================================================

  async expectMemberVisible(name: string): Promise<void> {
    const member = this.page.getByText(name, { exact: true }).first();
    await expect(member).toBeVisible({ timeout: 15000 });
  }

  async expectMemberGone(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
  }

  // ==========================================================
  // List Loading
  // ==========================================================

  private async waitForList(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    await expect(this.page.getByRole('progressbar')).toHaveCount(0);
  }
}