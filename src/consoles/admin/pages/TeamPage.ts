import { expect, type Locator } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';
import { TabBar } from '@/consoles/admin/components/TabBar';

export type TeamRole =
  | 'Super Admin'
  | 'General Manager'
  | 'Order Management Lead'
  | 'Order Management Agent'
  | 'Account Manager'
  | 'Business Development Executive'
  | 'Accounting'
  | 'Marketing Manager';

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
  'Account Manager',
  'Business Development Executive',
  'Accounting',
  'Marketing Manager',
];

/**
 * TeamPage — Super Admin "team" section.
 *
 * Members are grouped by role tab. Flow: pick a role tab, add a member,
 * search, edit (status -> Inactive), filter by status, delete.
 */
export class TeamPage extends AdminBasePage {
  readonly path = AdminRoutes.team;
  protected readonly heading = AdminSelectors.headings.team;

  private readonly tabs = new TabBar(this.page);

  /** All role tabs available in the Team section. */
  static readonly roles = ROLES;

  /* ------------------------------------------------------------------ *
   * Locators
   * ------------------------------------------------------------------ */

  private get addMemberButton(): Locator {
    return this.page.getByRole('button', { name: 'Add Member' });
  }

  private get searchInput(): Locator {
    return this.page.locator('input[name="searchValue"]');
  }

  /** Edit-form Status autocomplete — anchored to its "Status *" heading so it
   *  never collides with the toolbar's Status filter (same input id). */
  private get formStatusInput(): Locator {
    return this.page.locator(
      `xpath=//h6[normalize-space()='Status *']/following::input[@id='input-autocomplete-status'][1]`,
    );
  }

  /** Toolbar Status filter (carries the placeholder; the form one does not). */
  private get filterStatusInput(): Locator {
    return this.page.locator('#input-autocomplete-status[placeholder="Status"]');
  }

  /* ------------------------------------------------------------------ *
   * Tabs / roles
   * ------------------------------------------------------------------ */

  async openTab(name: string): Promise<void> {
    await this.tabs.select(name);
  }

  /** Selects a role tab (Super Admin, General Manager, ...). */
  async selectRole(role: TeamRole): Promise<void> {
    await this.tabs.select(role);
    await this.waitForList();
  }

  /* ------------------------------------------------------------------ *
   * Test data
   * ------------------------------------------------------------------ */

  static randomMember(overrides: Partial<MemberData> = {}): MemberData {
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

  /* ------------------------------------------------------------------ *
   * Create
   * ------------------------------------------------------------------ */

  async createMember(overrides: Partial<MemberData> = {}): Promise<MemberData> {
    const data = TeamPage.randomMember(overrides);

    await this.selectRole(data.role);

    await this.addMemberButton.click();
    await expect(this.page.getByRole('heading', { name: 'Add Member' })).toBeVisible();

    await this.page.locator('input[name="name"]').fill(data.name);
    await this.page.locator('input[name="email"]').fill(data.email);
    await this.page.locator('input[name="phoneNumber"]').fill(data.phone);
    await this.page.locator('input[name="password"]').fill(data.password);
    await this.page.locator('input[name="confirmPassword"]').fill(data.password);

    await this.page.getByRole('button', { name: 'Add User' }).click();
    await this.waitForList();

    return data;
  }

  /* ------------------------------------------------------------------ *
   * Search / selection
   * ------------------------------------------------------------------ */

  async searchMember(name: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.waitForList();
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  /** Opens the ⋮ actions menu on the row for `name`. */
  private async openRowActions(name: string): Promise<void> {
    const row = this.page.getByRole('row').filter({ hasText: name }).first();
    await row.getByRole('button').last().click();
    await expect(this.page.getByRole('menu')).toBeVisible();
  }

  /* ------------------------------------------------------------------ *
   * Update
   * ------------------------------------------------------------------ */

  async setStatus(name: string, status: 'Active' | 'Inactive'): Promise<void> {
    await this.searchMember(name);
    await this.openRowActions(name);
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();

    await this.selectAutocompleteLocator(this.formStatusInput, status);

    await this.page.getByRole('button', { name: 'Save Changes' }).click();
    await this.waitForList();
  }

  async filterByStatus(status: 'Active' | 'Inactive'): Promise<void> {
    await this.selectAutocompleteLocator(this.filterStatusInput, status);
    await this.waitForList();
  }

  /* ------------------------------------------------------------------ *
   * Delete
   * ------------------------------------------------------------------ */

  async deleteMember(name: string): Promise<void> {
    await this.searchMember(name);
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

  async expectMemberVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  async expectMemberGone(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
  }

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  private async selectAutocompleteLocator(input: Locator, option?: string): Promise<void> {
    await input.click();

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