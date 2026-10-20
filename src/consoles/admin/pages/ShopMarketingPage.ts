import { expect, type Locator, type Page } from '@playwright/test';
import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';

export interface SpendPromotionData {
    maxSpendLimit?: string;
    perUserLimit?: string;
    minSpend?: string;
    date?: string;
}

export interface NewUserDiscountData {
    maxDiscountPerOrder?: string;
    spendLimit?: string;
    date?: string;
}

/**
 * ShopMarketingPage — Super Admin "Shop Marketing" actions.
 *
 * Covers:
 * - Navigate from Shops list -> 3-dots kebab -> "Go to Marketing"
 * - Card 4: Spend Promotion (date picker, spend limit, per user limit, min spend, save)
 * - Card 5: New User Discount (next, max discount, date picker, spending limit, accept, save)
 * - End promotions (Manage Promotion -> End Promotion -> Confirm)
 */
export class ShopMarketingPage extends AdminBasePage {
    readonly path = AdminRoutes.shops;
    protected readonly heading = AdminSelectors.headings.shops;

    /** Exposes the underlying Playwright Page instance. */
    get pageInstance(): Page {
        return this.page;
    }

    /* ------------------------------------------------------------------ *
     * Navigation to Shop Marketing
     * ------------------------------------------------------------------ */

    /**
     * Ensures the sidebar drawer is open.
     * Clicks the banner menu toggle if the 'Shops' navigation link is not visible.
     */
    async ensureSidebarOpen(): Promise<void> {
        const shopsLink = this.page.getByRole('link', { name: 'Shops' });
        if (await shopsLink.isVisible({ timeout: 1500 }).catch(() => false)) {
            return;
        }

        const toggle = this.page
            .getByRole('banner')
            .getByRole('button')
            .filter({ hasText: /^$/ })
            .first();

        if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
            await toggle.click();
        } else {
            const fallbackToggle = this.page.locator('header button:has(svg), button[aria-label*="menu" i]').first();
            if (await fallbackToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
                await fallbackToggle.click();
            }
        }

        // Wait up to 5s for shops link; if still not visible, retry toggle once
        const opened = await shopsLink.isVisible({ timeout: 5000 }).catch(() => false);
        if (!opened && (await toggle.isVisible().catch(() => false))) {
            await toggle.click().catch(() => { });
        }
    }

    /** Navigates to Shops and opens "Go to Marketing" via the shop kebab menu. */
    async goToShopMarketing(shopName?: string): Promise<void> {
        if (!this.page.url().includes('/shops')) {
            await this.ensureSidebarOpen();
            const shopsLink = this.page.getByRole('link', { name: 'Shops' });
            await expect(shopsLink).toBeVisible({ timeout: 10_000 });
            await shopsLink.click();
            await this.page.waitForLoadState('networkidle').catch(() => { });
        }

        // Pick row: specific shop by text or first available shop row
        const row = shopName
            ? this.page.getByRole('row').filter({ hasText: shopName }).first()
            : this.page.getByRole('row').nth(1);

        const kebabBtn = row
            .locator('.MuiButtonBase-root.MuiIconButton-root')
            .or(this.page.locator('.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-1hd14n'))
            .first();

        await expect(kebabBtn).toBeVisible({ timeout: 10_000 });
        await kebabBtn.click();

        const marketingItem = this.page.getByRole('menuitem', { name: 'Go to Marketing' });
        if (!(await marketingItem.isVisible({ timeout: 1500 }).catch(() => false))) {
            await kebabBtn.click();
        }
        await expect(marketingItem).toBeVisible({ timeout: 5000 });
        await marketingItem.click();
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }

    /* ------------------------------------------------------------------ *
     * Promotion 1: Spend Promotion (Card 4)
     * ------------------------------------------------------------------ */

    /**
     * Configures and saves the first promotion (Card 4: Spend Promotion).
     */
    async createSpendPromotion(data: SpendPromotionData = {}): Promise<void> {
        const {
            maxSpendLimit = '100',
            perUserLimit = '5',
            minSpend = '100',
            date = '31',
        } = data;

        // 1. Click 4th promotion card
        const card4 = this.page
            .locator('div:nth-child(4) > .MuiStack-root.css-dmmwmi > .MuiStack-root.css-j7qwjs')
            .or(this.page.locator('.MuiStack-root.css-j7qwjs').nth(3))
            .first();
        await expect(card4).toBeVisible({ timeout: 10_000 });
        await card4.click();

        // 2. Date picker (picks day 31 or last active day of month)
        await this.page.getByRole('button', { name: 'Choose date', exact: true }).click();
        const dateCell = this.page
            .getByRole('dialog')
            .getByRole('gridcell', { name: date })
            .or(this.page.getByRole('dialog').locator('button[role="gridcell"]:not([disabled])').last());
        await dateCell.first().click();
        await this.page.getByRole('button', { name: 'OK' }).click();

        // 3. Maximum Promotion Spend Limit
        const maxSpendCheckbox = this.page.getByRole('checkbox', { name: 'Maximum Promotion Spend Limit' });
        if (await maxSpendCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
            await maxSpendCheckbox.check();
        }
        const maxSpendInput = this.page.getByRole('spinbutton', { name: 'Maximum Spend Limit' });
        await maxSpendInput.click();
        await maxSpendInput.fill(maxSpendLimit);

        // 4. Per User Limit
        const perUserCheckbox = this.page.getByRole('checkbox', { name: 'Per User Limit' });
        if (await perUserCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
            await perUserCheckbox.check();
        }
        const perUserInput = this.page.getByRole('spinbutton', { name: 'Per User Limit' });
        await perUserInput.click();
        await perUserInput.fill(perUserLimit);

        // 5. Minimum Spend*
        const minSpendInput = this.page.getByRole('spinbutton', { name: 'Minimum Spend*' });
        await minSpendInput.click();
        await minSpendInput.fill(minSpend);

        // 6. Save
        const saveBtn = this.page.getByRole('button', { name: 'Save' });
        await expect(saveBtn).toBeEnabled({ timeout: 5000 });
        await saveBtn.click();
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }

    /* ------------------------------------------------------------------ *
     * Promotion 2: New User Discount (Card 5)
     * ------------------------------------------------------------------ */

    /**
     * Configures and saves the second promotion ("New User Discount").
     */
    async createNewUserDiscount(data: NewUserDiscountData = {}): Promise<void> {
        const {
            maxDiscountPerOrder = '100',
            spendLimit = '100',
            date = '31',
        } = data;

        // 1. Click "New User Discount" card
        const card = this.page
            .getByText('New User DiscountAttract more')
            .or(this.page.getByText(/New User Discount/i))
            .first();
        await expect(card).toBeVisible({ timeout: 10_000 });
        await card.click();

        // 2. Click Next
        const nextBtn = this.page.getByRole('button', { name: 'Next', exact: true });
        await expect(nextBtn).toBeVisible({ timeout: 5000 });
        await nextBtn.click();

        // 3. Set Max Discount Per Order
        const maxDiscCheckbox = this.page.getByRole('checkbox', { name: 'Set Max Discount Per Order' });
        if (await maxDiscCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
            await maxDiscCheckbox.check();
        }
        const maxDiscInput = this.page.locator('input[name="maxDiscountPerOrder"]');
        await maxDiscInput.click();
        await maxDiscInput.fill(maxDiscountPerOrder);

        // 4. Date picker
        await this.page.getByRole('button', { name: 'Choose date', exact: true }).click();
        const dateCell = this.page
            .getByRole('dialog')
            .getByRole('gridcell', { name: date })
            .or(this.page.getByRole('dialog').locator('button[role="gridcell"]:not([disabled])').last());
        await dateCell.first().click();
        await this.page.getByRole('button', { name: 'OK' }).click();

        // 5. Set Max Spending Limit
        const spendLimitCheckbox = this.page.getByRole('checkbox', { name: 'Set Max Spending Limit' });
        if (await spendLimitCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
            await spendLimitCheckbox.check();
        }
        const spendLimitInput = this.page.locator('input[name="spendLimit"]');
        await spendLimitInput.click();
        await spendLimitInput.fill(spendLimit);

        // 6. I Accept checkbox
        const acceptCheckbox = this.page.getByRole('checkbox', { name: 'I Accept' });
        await acceptCheckbox.check();

        // 7. Save
        const saveBtn = this.page.getByRole('button', { name: 'Save' });
        await expect(saveBtn).toBeEnabled({ timeout: 5000 });
        await saveBtn.click();
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }

    /* ------------------------------------------------------------------ *
     * Teardown / End Promotions
     * ------------------------------------------------------------------ */

    /**
     * Ends an active promotion by card index (e.g. 4 or 5).
     */
    async endPromotion(cardIndex: number = 4): Promise<void> {
        const card = this.page
            .locator(`div:nth-child(${cardIndex}) > .MuiStack-root.css-dmmwmi > .MuiStack-root.css-j7qwjs`)
            .or(this.page.locator('.MuiStack-root.css-j7qwjs').nth(cardIndex - 1))
            .first();

        await expect(card).toBeVisible({ timeout: 10_000 });
        await card.click();

        const manageBtn = this.page.getByRole('button', { name: 'Manage Promotion' });
        await expect(manageBtn).toBeVisible({ timeout: 5000 });
        await manageBtn.click();

        const endBtn = this.page.getByRole('button', { name: 'End Promotion' });
        await expect(endBtn).toBeVisible({ timeout: 5000 });
        await endBtn.click();

        const confirmBtn = this.page
            .getByRole('dialog')
            .getByRole('button', { name: 'Confirm' })
            .or(this.page.getByRole('button', { name: 'Confirm' }))
            .last();

        await expect(confirmBtn).toBeVisible({ timeout: 5000 });
        await confirmBtn.click();
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }

    /** Navigates back to home/dashboard by clicking the Logo link. */
    async clickLogo(): Promise<void> {
        await this.page.getByRole('link', { name: 'Logo' }).click();
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }
}
