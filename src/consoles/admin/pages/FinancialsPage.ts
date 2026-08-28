import { AdminBasePage } from '@/consoles/admin/pages/AdminBasePage';
import { AdminRoutes } from '@/consoles/admin/config/admin.routes';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';
import { TabBar } from '@/consoles/admin/components/TabBar';

/**
 * FinancialsPage — Super Admin "financials" section.
 *
 * STUB: navigation + load check only. Add CRUD / tab methods here as the
 * real screens are confirmed (same workflow as the Shop console).
 */
export class FinancialsPage extends AdminBasePage {
  readonly path = AdminRoutes.financials;
  protected readonly heading = AdminSelectors.headings.financials;

  private readonly tabs = new TabBar(this.page);

  /** Switch to a tab on this page by name (if the page has tabs). */
  async openTab(name: string): Promise<void> {
    await this.tabs.select(name);
  }
}
