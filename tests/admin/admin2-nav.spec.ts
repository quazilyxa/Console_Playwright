import { test, expect } from '@/consoles/admin/admin.fixture';
import type { BannerData } from '@/consoles/admin/pages/BannerPage';
import type { ListContainerData, TagData } from '@/consoles/admin/pages/Tags&ContainerPage';

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
 */
test.describe('Super Admin — Display through Marketing', () => {
  test('navigates Display through Marketing', async ({ admin, step }) => {
    const failures: { page: string; error: string }[] = [];

    const visit = async (
      name: string,
      body: () => Promise<void>,
    ) => {
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

    await visit('Display → Ads Banner', async () => {
      await admin.sidebar.goTo('Display');

      await admin.display.openAdsBanner();

      await admin.display.selectScreen('Home');
    });

    // ==========================================================
    // CREATE BANNER
    // ==========================================================

    let banner: BannerData | undefined;

    await visit('Create Banner', async () => {
      const created = await admin.display.createBanner({
        screen: 'Home',
      });

      banner = created;

      await admin.display.searchBanner(
        created.title,
      );

      await admin.display.expectBannerVisible(
        created.title,
      );
    });

    // ==========================================================
    // UPDATE BANNER SCREEN
    // ==========================================================

    await visit('Update Banner Screen', async () => {
      if (!banner) {
        throw new Error(
          'Skipped — banner was never created.',
        );
      }

      // Change Home → Food
      await admin.display.changeScreen(
        banner.title,
        'Food',
      );

      // Open Food screen
      await admin.display.selectScreen('Food');
    });

    // ==========================================================
    // DELETE BANNER
    // ==========================================================

    await visit('Delete Banner', async () => {
      if (!banner) {
        throw new Error(
          'Skipped — banner was never created.',
        );
      }

      await admin.display.deleteBanner(
        banner.title,
      );

      await admin.display.expectBannerGone(
        banner.title,
      );
    });

    // ==========================================================
    // TAGS
    // ==========================================================

    let tag: TagData | undefined;

    await visit('Tags — Add, Update and Delete', async () => {
    await admin.tags.gotoTags();

      // ------------------------------------------------------
      // ADD TAG
      // ------------------------------------------------------

      const createdTag = await admin.tags.createTag();

      tag = createdTag;

      console.log(
        `Created tag: ${createdTag.name}`,
      );


      // ------------------------------------------------------
      // DELETE TAG
      // ------------------------------------------------------

      await admin.tags.deleteTag(
        createdTag.name,
      );

      // Verify deleted
      await admin.tags.expectTagGone(
        createdTag.name,
      );
    });

// ==========================================================
// LIST CONTAINERS
// ==========================================================

    let listContainer: ListContainerData | undefined;

    await visit('List Containers — Add and Delete', async () => {
      await admin.tags.gotoListContainers();

      const created = await admin.tags.createListContainer();
      listContainer = created;

      console.log(`Created list container: ${created.name}`);
      console.log(
        `  Zone: ${created.zone}, Deal: ${created.deal}, Tag: ${created.tag}, Restaurant: ${created.restaurant}`,
      );

      await admin.tags.searchListContainer(created.name);

      await admin.tags.deleteListContainer(created.name);

      await admin.tags.expectListContainerGone(created.name);
    });



// ==========================================================
// FILTER CONTAINERS — SHUFFLE
// ==========================================================

  await visit('Filter Containers — Shuffle', async () => {
    await admin.tags.gotoFilterContainers();
    await admin.tags.shuffleFirstTwoFilterContainers();
  });

  // ==========================================================
  // USER APP SECTIONS — SHUFFLE
  // ==========================================================

  await visit('User App Sections — Shuffle', async () => {
    await admin.tags.gotoUserAppSections();
    await admin.tags.shuffleFirstTwoUserAppSections();
  });

    // ==========================================================
    // SETTINGS
    // ==========================================================

    await visit('Settings', async () => {
      await admin.sidebar.goTo('Settings');
      await admin.settings.expectLoaded();
    });

    // ==========================================================
    // CHAT
    // ==========================================================

    await visit('Chat', async () => {
      await admin.sidebar.goTo('Chat');
      await admin.chat.expectLoaded();
    });

    // ==========================================================
    // MARKETING
    // ==========================================================

    await visit('Marketing', async () => {
      await admin.sidebar.goTo('Marketing');
      await admin.marketing.expectLoaded();
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