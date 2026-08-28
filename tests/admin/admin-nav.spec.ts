import { test, expect } from '@/consoles/admin/admin.fixture';
import { AdminSelectors } from '@/consoles/admin/selectors/admin.selectors';
import type { ParentData } from '@/consoles/admin/pages/ParentsPage';
import type { ShopData } from '@/consoles/admin/pages/ShopsPage';
import { RiderData } from '@/consoles/admin/pages/RidersPage';
import { TeamPage, type MemberData } from '@/consoles/admin/pages/TeamPage';
import type { BannerData } from '@/consoles/admin/pages/DisplayPage';

/**
 * Super Admin — full nav sweep (Dashboard → Marketing).
 * One test; each page wrapped in visit() so one broken page doesn't stop the run.
 */
test.describe('Super Admin — Navigation', () => {
  test('navigates Dashboard through Marketing', async ({ admin, step }) => {
    const failures: { page: string; error: string }[] = [];

    const visit = async (name: string, body: () => Promise<void>) => {
      try {
        await step(name, body);
      } catch (err) {
        const message = (err as Error).message ?? String(err);
        failures.push({ page: name, error: message });
        console.error(`[NAV] "${name}" failed — continuing. Reason: ${message}`);
      }
    };

    // ---- PART 1: Dashboard → Financials ----
    await visit('Dashboard', async () => {
      await admin.dashboard.goto();
      await admin.dashboard.expectLoaded();
      for (const tab of AdminSelectors.tabs.dashboard) {
        await admin.dashboard.openTab(tab);
      }

      // Customer-tab interactions
      // await admin.dashboard.openTab('Customer');
      // await admin.dashboard.customerTabFlow();
    });

    await visit('Orders', async () => {
      await admin.sidebar.goTo('Orders');
      await admin.orders.expectLoaded();

      await admin.orders.searchOrders('Berlin');
      await admin.orders.openFirstPlacedOrder();
      await admin.orders.reviewOrderDetails();

      // await admin.orders.changeAddress();
      await admin.orders.adjustOrder();
      await admin.orders.updateStatusToPreparing();
      await admin.orders.cancelOrder();

      // Flag flow on a delivered order
      await admin.orders.openDeliveredCurrentMonth();
      await admin.orders.flagFirstFlaggableOrder();
    });

    await visit('Parents', async () => {
      await admin.sidebar.goTo('Parents');
      await admin.parents.expectLoaded();

    //   // Created in the first sub-step, reused by the ones after it.
      let parent: ParentData | undefined;

      await visit('Create Parent', async () => {
        parent = await admin.parents.createParent();
        await admin.parents.searchParent(parent.name);
        await admin.parents.expectParentVisible(parent.name);
      });

      await visit('Deactivate Parent', async () => {
        if (!parent) throw new Error('Skipped — parent was never created.');

        await admin.parents.setStatus(parent.name, 'Inactive');
        await admin.parents.filterByStatus('Inactive');
        await admin.parents.searchParent(parent.name);
        await admin.parents.expectParentVisible(parent.name);
      });

      await visit('Delete Parent', async () => {
        if (!parent) throw new Error('Skipped — parent was never created.');

        await admin.parents.deleteParent(parent.name);
        await admin.parents.expectParentGone(parent.name);
      });
    });
// ----------------------------end of parent and start of shop-----------------------
  // let shop: ShopData;

  // await step('Open Shops', async () => {
  //     await admin.sidebar.goTo('Shops');
  //     await admin.shops.expectLoaded();
  //   });
 
  //   await step('Create a new shop', async () => {
  //     shop = await admin.shops.createShop();
  //     await admin.shops.searchShop(shop.shopName);
  //     await admin.shops.expectShopVisible(shop.shopName);
  //   });
 
  //   await step('Set the shop to Inactive', async () => {
  //     await admin.shops.setStatus(shop.shopName, 'Inactive');
  //     // await admin.shops.filterByStatus('Inactive');
  //     await admin.shops.searchShop(shop.shopName);
  //     await admin.shops.expectShopVisible(shop.shopName);
  //   });
 
  //   await step('Delete the shop', async () => {
  //     await admin.shops.deleteShop(shop.shopName);
  //     await admin.shops.expectShopGone(shop.shopName);
  //   });

    // ----------------------------------------------------------------------------------------
    await visit('Users', async () => {
      await admin.sidebar.goTo('Users');
      await admin.users.expectLoaded();
    });
// ----------------------------------------------------------------------------------------
// let rider: RiderData;
//  await step('Open Riders', async () => {
//       await admin.sidebar.goTo('Riders');
//       await admin.riders.expectLoaded();
//     });
 
//     await step('Create a new rider', async () => {
//       rider = await admin.riders.createRider();
//       await admin.riders.searchRider(rider.name);
//       await admin.riders.expectRiderVisible(rider.name);
//     });
 
//     await step('Set the rider to Inactive', async () => {
//       await admin.riders.setStatus(rider.name, 'Inactive');
//       await admin.riders.expectRiderVisible(rider.name);
//     });
 
//     await step('Delete the rider', async () => {
//       await admin.riders.deleteRider(rider.name);
//       await admin.riders.expectRiderGone(rider.name);
//     });
    // ----------------------------------------------------------------

    // await visit('Financials', async () => {
    //   // Parent only expands the submenu — no page/heading of its own.
    //   await visit('Lyxa Financials', async () => {
    //     await admin.sidebar.goToSub('Financials', 'Lyxa Financials');
    //     await admin.financials.expectLoaded();
    //   });
    //   await visit('Parent Financials', async () => {
    //     await admin.sidebar.goToSub('Financials', 'Parent Financials');
    //     await admin.financials.expectLoaded();
    //   });
    //   await visit('Riders Financials', async () => {
    //     await admin.sidebar.goToSub('Financials', 'Riders Financials');
    //     await admin.financials.expectLoaded();
    //   });
    // });

    // ---- PART 2: Team → Marketing ----
//      await visit('Team', async () => {
//   await admin.sidebar.goTo('Team');
//   await admin.team.expectLoaded();

//   for (const role of TeamPage.roles) {
//     let member: MemberData | undefined;

//     await visit(`Create Member (${role})`, async () => {
//       member = await admin.team.createMember({ role });
//       await admin.team.searchMember(member.name);
//       await admin.team.expectMemberVisible(member.name);
//     });

//     await visit(`Deactivate Member (${role})`, async () => {
//       if (!member) throw new Error('Skipped — member was never created.');
//       await admin.team.setStatus(member.name, 'Inactive');
//       await admin.team.filterByStatus('Inactive');
//       await admin.team.searchMember(member.name);
//       await admin.team.expectMemberVisible(member.name);
//     });

//     await visit(`Delete Member (${role})`, async () => {
//       if (!member) throw new Error('Skipped — member was never created.');
//       await admin.team.deleteMember(member.name);
//       await admin.team.expectMemberGone(member.name);
//       await admin.team.filterByStatus('Active');
//     });
//   }
// });

await visit('Ads Banner', async () => {
  await admin.sidebar.goTo('Display');
  await admin.display.openAdsBanner();       // enter the Ads Banner sub-tab
  await admin.display.selectScreen('Home');  // start on the Home screen

  let banner: BannerData | undefined;

    await visit('Create Banner', async () => {
      const created = await admin.display.createBanner({ screen: 'Home' });
      banner = created;
      await admin.display.searchBanner(created.title);
      await admin.display.expectBannerVisible(created.title);
    });




  await visit('Update Banner Screen', async () => {
    if (!banner) throw new Error('Skipped — banner was never created.');

    await admin.display.changeScreen(banner.title, 'Food');

    await admin.display.selectScreen('Food');  // banner moved Home -> Food
    await admin.display.searchBanner(banner.title);
    await admin.display.expectBannerVisible(banner.title);
  });

  await visit('Toggle Banner Inactive/Active', async () => {
    if (!banner) throw new Error('Skipped — banner was never created.');

    await admin.display.searchBanner(banner.title);

    await admin.display.toggleStatus();              // -> Inactive
    await admin.display.filterByStatus('Inactive');  // filter to find it
    await admin.display.searchBanner(banner.title);
    await admin.display.expectBannerVisible(banner.title);

    await admin.display.toggleStatus();              // -> Active again
    await admin.display.filterByStatus('Active');    // reset filter
  });

  await visit('Delete Banner', async () => {
    if (!banner) throw new Error('Skipped — banner was never created.');

    await admin.display.deleteBanner(banner.title);
    await admin.display.expectBannerGone(banner.title);
  });
});



    await visit('Settings', async () => {
      await admin.sidebar.goTo('Settings');
      await admin.settings.expectLoaded();
    });

    await visit('Chat', async () => {
      await admin.sidebar.goTo('Chat');
      await admin.chat.expectLoaded();
    });

    await visit('Marketing', async () => {
      await admin.sidebar.goTo('Marketing');
      await admin.marketing.expectLoaded();
    });

    // ---- VERDICT ----
    if (failures.length > 0) {
      const report = failures.map((f) => `  • ${f.page}: ${f.error}`).join('\n');
      expect(failures.length, `Completed with problems:\n${report}`).toBe(0);
    }
  });
});