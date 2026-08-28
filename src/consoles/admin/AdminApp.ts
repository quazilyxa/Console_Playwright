import { Page } from '@playwright/test';
import { AdminSidebar } from '@/consoles/admin/components/AdminSidebar';
import { AdminLoginPage } from '@/consoles/admin/components/AdminLoginPage';
import { DashboardPage } from '@/consoles/admin/pages/DashboardPage';
import { OrdersPage } from '@/consoles/admin/pages/OrdersPage';
import { ParentsPage } from '@/consoles/admin/pages/ParentsPage';
import { ShopsPage } from '@/consoles/admin/pages/ShopsPage';
import { UsersPage } from '@/consoles/admin/pages/UsersPage';
import { RidersPage } from '@/consoles/admin/pages/RidersPage';
import { FinancialsPage } from '@/consoles/admin/pages/FinancialsPage';
import { TeamPage } from '@/consoles/admin/pages/TeamPage';
import { DisplayPage } from '@/consoles/admin/pages/DisplayPage';
import { SettingsPage } from '@/consoles/admin/pages/SettingsPage';
import { ChatPage } from '@/consoles/admin/pages/ChatPage';
import { MarketingPage } from '@/consoles/admin/pages/MarketingPage';

/** Aggregates every Super Admin page object and shared component. */
export class AdminApp {
  readonly login: AdminLoginPage;
  readonly sidebar: AdminSidebar;

  readonly dashboard: DashboardPage;
  readonly orders: OrdersPage;
  readonly parents: ParentsPage;
  readonly shops: ShopsPage;
  readonly users: UsersPage;
  readonly riders: RidersPage;
  readonly financials: FinancialsPage;
  readonly team: TeamPage;
  readonly display: DisplayPage;
  readonly settings: SettingsPage;
  readonly chat: ChatPage;
  readonly marketing: MarketingPage;

  constructor(page: Page) {
    this.login = new AdminLoginPage(page);
    this.sidebar = new AdminSidebar(page);

    this.dashboard = new DashboardPage(page);
    this.orders = new OrdersPage(page);
    this.parents = new ParentsPage(page);
    this.shops = new ShopsPage(page);
    this.users = new UsersPage(page);
    this.riders = new RidersPage(page);
    this.financials = new FinancialsPage(page);
    this.team = new TeamPage(page);
    this.display = new DisplayPage(page);
    this.settings = new SettingsPage(page);
    this.chat = new ChatPage(page);
    this.marketing = new MarketingPage(page);
  }
}
