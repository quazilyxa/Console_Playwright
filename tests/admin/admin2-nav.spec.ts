import { test, expect } from '@/consoles/admin/admin.fixture';
import type { BannerData } from '@/consoles/admin/pages/BannerPage';
import type { ListContainerData, TagData } from '@/consoles/admin/pages/Tags&ContainerPage';
import { VendorsPage, type VendorData } from '@/consoles/admin/pages/VendorsPage';
import { MarketingPage, type CampaignData, type QrCodeCampaignData } from '@/consoles/admin/pages/MarketingPage';
import type { CustomizedShopsSectionData, CustomizedItemsSectionData } from '@/consoles/admin/pages/CustomisedSection';


/**
 * Super Admin — Display → Marketing
 *
 * Covers:
 * Display
 *   → Ads Banner
 *   → Create Banner
 *   → Update Banner Screen
 *   → Delete Banner
 *   → Tags
 *      → Create Tag
 *      → Search Tag
 *      → Update Tag
 *      → Delete Tag
 *   → List Containers
 * Settings
 * Chat
 * Marketing
 * Shop Marketing
 * Access As Shop
 */
test.describe('Super Admin — Display through Marketing', () => {
  test('navigates Display through Marketing', async ({ admin, step }) => {
    const failures: { page: string; error: string }[] = [];

    const visit = async (
      name: string,
      body: () => Promise<void>,
    ) => {
      if (failures.some((f) => f.error.includes('Target page, context or browser has been closed'))) {
        return;
      }

      try {
        await step(name, body);
      } catch (err) {
        const message =
          (err as Error).message ?? String(err);

        failures.push({
          page: name,
          error: message,
        });

        console.error(
          `[DISPLAY] "${name}" failed — continuing. Reason: ${message}`,
        );
      }
    };

    // ==========================================================
    // OPEN ADMIN DASHBOARD
    // ==========================================================

    await visit('Open Admin Dashboard', async () => {
      await admin.dashboard.goto();
      await admin.dashboard.expectLoaded();
    });

    // ==========================================================
    // DISPLAY → ADS BANNER
    // ==========================================================

    // await visit('Display → Ads Banner', async () => {
    //   await admin.sidebar.goTo('Display');

    //   await admin.display.openAdsBanner();

    //   await admin.display.selectScreen('Home');
    // });

    // // ==========================================================
    // // CREATE BANNER
    // // ==========================================================

    // let banner: BannerData | undefined;

    // await visit('Create Banner', async () => {
    //   const created = await admin.display.createBanner({
    //     screen: 'Home',
    //   });

    //   banner = created;

    //   await admin.display.searchBanner(
    //     created.title,
    //   );

    //   await admin.display.expectBannerVisible(
    //     created.title,
    //   );
    // });

    //     // ==========================================================
    //     // UPDATE BANNER SCREEN
    //     // ==========================================================

    //     await visit('Update Banner Screen', async () => {
    //       if (!banner) {
    //         throw new Error(
    //           'Skipped — banner was never created.',
    //         );
    //       }

    //       // Change Home → Food
    //       await admin.display.changeScreen(
    //         banner.title,
    //         'Food',
    //       );

    //       // Open Food screen
    //       await admin.display.selectScreen('Food');
    //     });

    //     // ==========================================================
    //     // DELETE BANNER
    //     // ==========================================================

    //     await visit('Delete Banner', async () => {
    //       if (!banner) {
    //         throw new Error(
    //           'Skipped — banner was never created.',
    //         );
    //       }

    //       await admin.display.deleteBanner(
    //         banner.title,
    //       );

    //       await admin.display.expectBannerGone(
    //         banner.title,
    //       );
    //     });

    //     // ==========================================================
    //     // TAGS
    //     // ==========================================================

    //     let tag: TagData | undefined;

    //     await visit('Tags — Add, Update and Delete', async () => {
    //     await admin.tags.gotoTags();

    //       // ------------------------------------------------------
    //       // ADD TAG
    //       // ------------------------------------------------------

    //       const createdTag = await admin.tags.createTag();

    //       tag = createdTag;

    //       console.log(
    //         `Created tag: ${createdTag.name}`,
    //       );


    //       // ------------------------------------------------------
    //       // DELETE TAG
    //       // ------------------------------------------------------

    //       await admin.tags.deleteTag(
    //         createdTag.name,
    //       );

    //       // Verify deleted
    //       await admin.tags.expectTagGone(
    //         createdTag.name,
    //       );
    //     });

    // // ==========================================================
    // // LIST CONTAINERS
    // // ==========================================================

    //     let listContainer: ListContainerData | undefined;

    //     await visit('List Containers — Add and Delete', async () => {
    //       await admin.tags.gotoListContainers();

    //       const created = await admin.tags.createListContainer();
    //       listContainer = created;

    //       console.log(`Created list container: ${created.name}`);
    //       console.log(
    //         `  Zone: ${created.zone}, Deal: ${created.deal}, Tag: ${created.tag}, Restaurant: ${created.restaurant}`,
    //       );

    //       await admin.tags.searchListContainer(created.name);

    //       await admin.tags.deleteListContainer(created.name);

    //       await admin.tags.expectListContainerGone(created.name);
    //     });



    //     await visit('Filter Containers — Shuffle', async () => {
    //       await admin.tags.gotoFilterContainers();
    //       await admin.tags.shuffleFirstTwoFilterContainers();
    //     });

    //     // ==========================================================
    //     // USER APP SECTIONS — SHUFFLE
    //     // ==========================================================

    //     await visit('User App Sections — Shuffle', async () => {
    //       await admin.tags.gotoUserAppSections();
    //       await admin.tags.shuffleFirstTwoUserAppSections();
    //     });

    // ==========================================================
    // USER APP SECTIONS — CUSTOMISED SECTIONS (SHOPS & ITEMS)
    // ==========================================================

    // await visit('User App Sections — Customised Shops Section Lifecycle', async () => {
    //   await admin.sidebar.goTo('Display');
    //   await admin.customisedSection.gotoUserAppSections();

    //   // 1. Create "Customized shops" section
    //   const shopsSection = await admin.customisedSection.createCustomizedShopsSection({
    //     sectionName: 'Item Section 101',
    //     screenSection: 'Customized shops',
    //     zone: 'Dhaka New',
    //     zoneSearch: 'Dhaka',
    //     tag: 'Coffee',
    //     tagSearch: 'Coffee',
    //     shopName: 'Coffee Prince Coffee Prince',
    //   });

    //   // 2. Search & Delete
    //   await admin.customisedSection.searchSection(shopsSection.sectionName);
    //   await admin.customisedSection.deleteSection(shopsSection.sectionName);
    // });

    // await visit('User App Sections — Customised Items Section Lifecycle', async () => {
    //   await admin.customisedSection.gotoUserAppSections();

    //   // 1. Create "Customized items" section
    //   const itemsSection = await admin.customisedSection.createCustomizedItemsSection({
    //     sectionName: 'Item 101',
    //     screenSection: 'Customized items',
    //     zone: 'Dhaka New',
    //     zoneSearch: 'Dhaka',
    //     shop: 'Test Shop',
    //     shopSearch: 'Test Shop',
    //     category: 'Premium',
    //   });

    //   // 2. Search & Delete & Clear
    //   await admin.customisedSection.searchSection(itemsSection.sectionName);
    //   await admin.customisedSection.deleteSection(itemsSection.sectionName);
    //   await admin.customisedSection.clearSearch();
    // });


    //         // ==========================================================
    //     // SERVICE SECTION (navigation only — actions TBD)
    //     // ==========================================================

    //     await visit('Service Section — Navigate', async () => {
    //       await admin.tags.gotoServiceSection();
    //     });

    //     // ==========================================================
    //     // APP APPEARANCE (navigation only — actions TBD)
    //     // ==========================================================

    //     await visit('App Appearance — Navigate', async () => {
    //       await admin.tags.gotoAppAppearance();
    //     });

    //     // // ==========================================================
    //     // // VENDORS
    //     // // ==========================================================

    //     // await visit('Vendors — Navigate', async () => {
    //     //   await admin.sidebar.goTo('Vendors');

    //     //   // TODO: Add Vendors page actions here once VendorsPage is built
    //     //   await admin.vendors.expectLoaded();
    //     // });
    //     // ==========================================================
    //     // VENDORS (Full Lifecycle: Create -> Search -> Edit -> Delete)
    //     // ==========================================================

    //     let vendor: VendorData | undefined;

    //     await visit('Vendors — Lifecycle', async () => {
    //       await admin.sidebar.goTo('Vendors');
    //       await admin.vendors.gotoVendors();

    //       // 1. Create Vendor
    //       await visit('Vendors — Create', async () => {
    //         const created = await admin.vendors.createVendor();
    //         vendor = created;

    //         console.log(`Created vendor: ${created.name}`);
    //         console.log(
    //           `  Zone: ${created.zone}, Type: ${created.type}, Parent: ${created.parent}`
    //         );
    //       });

    //       // 2. Search Newly Added Vendor & Verify Visible
    //       await visit('Vendors — Search & Verify', async () => {
    //         if (!vendor) throw new Error('Skipped — vendor was never created.');
    //         await admin.vendors.searchVendor(vendor.name);
    //         await admin.vendors.expectVendorVisible(vendor.name);
    //       });

    //       // 3. Edit Vendor — Change Owner Name & Save
    //       await visit('Vendors — Edit Owner Name', async () => {
    //         if (!vendor) throw new Error('Skipped — vendor was never created.');
    //         const updatedOwner = `Owner-${Date.now().toString().slice(-8)}`;
    //         await admin.vendors.updateOwnerName(vendor.name, updatedOwner);
    //       });

    //       // 4. Delete Vendor & Confirm Deletion
    //       await visit('Vendors — Delete', async () => {
    //         if (!vendor) throw new Error('Skipped — vendor was never created.');
    //         await admin.vendors.deleteVendor(vendor.name);
    //         await admin.vendors.expectVendorGone(vendor.name);
    //       });
    //     });



    //     // ==========================================================
    //     // SETTINGS
    //     // ==========================================================

    //     await visit('Settings', async () => {
    //       await admin.sidebar.goTo('Settings');
    //       await admin.settings.expectLoaded();
    //     });

    //     // ==========================================================
    //     // CHAT
    //     // ==========================================================

    //     await visit('Chat', async () => {
    //       await admin.sidebar.goTo('Chat');
    //       await admin.chat.expectLoaded();
    //     });

    // ==========================================================
    // MARKETING — Limited Time Offers & Campaign Lifecycle
    // ==========================================================

    // await visit('Marketing — Overview & Configuration', async () => {
    //   await admin.sidebar.goTo('Marketing');
    //   await admin.marketing.expectLoaded();

    //   // 1. Limited Time Offers -> Configuration
    //   await admin.marketing.openTab('Limited Time Offers');
    //   await admin.marketing.openSubTab('Configuration');

    //   // Add preset and max cap, then save configuration
    //   await admin.marketing.addDiscountPreset('5');
    //   await admin.marketing.addMaxDiscountCap('5');
    //   await admin.marketing.saveConfiguration();
    // });

    // await visit('Marketing — Campaign Management & Creation', async () => {
    //   // 2. Campaign Management -> Start New Campaign
    //   await admin.marketing.openSubTab('Campaign Management');
    //   await admin.marketing.openStartNewCampaign();

    //   const campaignData = MarketingPage.randomCampaign({
    //     title: 'New Camp',
    //     subtitle: 'Summer Camp',
    //     sectionDisplayName: 'Summer Camp',
    //     repeatDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    //   });
    //   await admin.marketing.fillCampaignDetails(campaignData);
    //   await admin.marketing.saveAndPublishCampaign();
    // });

    // await visit('Marketing — History & Discard Flow', async () => {
    //   // 3. History Tab -> Discard prompt
    //   await admin.marketing.openSubTab('History');
    //   await admin.marketing.discardIfPrompted();
    // });

    // await visit('Marketing — Add Shop to Campaign', async () => {
    //   // 4. Return to Campaign Management -> Expand Card -> Add Shop & Items
    //   await admin.marketing.openSubTab('Campaign Management');
    //   await admin.marketing.expandCampaign(/New Camp/i);
    //   await admin.marketing.addShopToCampaign({
    //     shopName: 'Test Shop',
    //     discountPercentage: '15%',
    //     maxDiscountCap: '10',
    //     itemNames: ['Iced Coke', 'Attribute Test'],
    //   });

    //   // 5. Navigate back via Logo link
    //   await admin.marketing.clickLogo();
    // });

    // await visit('Marketing — Delete Campaign & Configuration', async () => {
    //   // Return to Marketing if previous step navigated to Logo/Dashboard
    //   if (!admin.marketing.pageInstance.url().includes('marketing')) {
    //     await admin.sidebar.goTo('Marketing');
    //   }
    //   await admin.marketing.openTab('Limited Time Offers');

    //   // 6. Delete created campaign
    //   await admin.marketing.deleteCampaign();

    //   // 7. Delete configuration preset & max cap, then Save
    //   await admin.marketing.deleteConfiguration();

    //   // 8. Navigate back via Logo link
    //   await admin.marketing.clickLogo();
    // });

    // // ==========================================================
    // // MARKETING — QR Code Generator Lifecycle
    // // ==========================================================

    // await visit('Marketing — QR Code Generator', async () => {
    //   // Return to Marketing if previous step navigated to Logo/Dashboard
    //   if (!admin.marketing.pageInstance.url().includes('marketing')) {
    //     await admin.sidebar.goTo('Marketing');
    //   }

    //   // 1. Switch to QR Code Generator tab
    //   await admin.marketing.openTab('Qr Code Generator');

    //   // 2. Create QR Code Campaign (Dhamaka -> Active -> Shop -> Food -> Test Shop)
    //   await admin.marketing.createQrCode({
    //     campaignName: 'Dhamaka',
    //     status: 'Active',
    //     redirectTo: 'Shop',
    //     shopType: 'Food',
    //     shopName: 'Test Shop',
    //   });

    //   // 3. Preview QR code thumbnail and dismiss dialog
    //   await admin.marketing.previewQrCode('Dhamaka');

    //   // 4. Copy link and download QR code
    //   await admin.marketing.copyQrLinkAndDownload('Dhamaka');

    //   // 5. Delete QR code via kebab menu and confirm
    //   await admin.marketing.deleteQrCode('Dhamaka');

    //   // 6. Navigate back via Logo link
    //   await admin.marketing.clickLogo();
    // });

    // // ==========================================================
    // // SHOP MARKETING — Promotions Lifecycle (Spend & New User Discount)
    // // ==========================================================

    // await visit('Shop Marketing — Spend & New User Promotions Lifecycle', async () => {
    //   // 1. Navigate to Shops -> First Shop -> Go to Marketing
    //   await admin.shopMarketing.goToShopMarketing();

    //   // 2. Configure & Save First Promotion (Spend Promotion)
    //   await admin.shopMarketing.createSpendPromotion({
    //     maxSpendLimit: '100',
    //     perUserLimit: '5',
    //     minSpend: '100',
    //   });

    //   // 3. Configure & Save Second Promotion (New User Discount)
    //   await admin.shopMarketing.createNewUserDiscount({
    //     maxDiscountPerOrder: '100',
    //     spendLimit: '100',
    //   });

    //   // 4. End Both Promotions (Teardown)
    //   await admin.shopMarketing.endPromotion(4);
    //   await admin.shopMarketing.endPromotion(5);

    //   // 5. Navigate back via Logo link
    //   await admin.shopMarketing.clickLogo();
    // });

    // ==========================================================
    // ACCESS AS SHOP — Impersonation & Shop Navigation Lifecycle
    // ==========================================================

    await visit('Access As Shop — Impersonation, Settings & Navigation Lifecycle', async () => {
      // 1. Navigate to Shops -> Access As Shop
      await admin.accessAsShop.accessShop();

      // 2. Settings -> Delivery Settings -> Configure Amount & Save
      await admin.accessAsShop.configureDeliverySettings({
        amount: '90000',
        updateAmount: '100000',
      });

      // 3. Dashboard -> Verify Customer & Operations filters
      await admin.accessAsShop.verifyShopDashboard();

      // 4. Marketing -> Verify view
      await admin.accessAsShop.verifyMarketing();

      // 5. Finance -> Filter This Year & Record payment
      await admin.accessAsShop.recordFinancePayment({
        amount: '90000',
        note: 'Test',
      });

      // 6. Profile -> Issues
      await admin.accessAsShop.verifyShopProfile();

      // 7. Products -> Attribute Settings & Stock Tabs
      await admin.accessAsShop.verifyShopProducts();

      // 8. Return back to Super Admin
      await admin.accessAsShop.returnToAdmin();
    });

    // ==========================================================
    // VERDICT
    // ==========================================================

    if (failures.length > 0) {
      const report = failures
        .map(
          (failure) =>
            `  • ${failure.page}: ${failure.error}`,
        )
        .join('\n');

      expect(
        failures.length,
        `Completed with problems:\n${report}`,
      ).toBe(0);
    }
  });
});

