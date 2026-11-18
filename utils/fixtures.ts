import { test as base, expect } from '@playwright/test';
import { GaragePage } from '../pages/GaragePage';

type Fixtures = {
  userGaragePage: GaragePage;
};

export const test = base.extend<Fixtures>({
  userGaragePage: async ({ page }, use) => {
    const garagePage = new GaragePage(page);

    await page.goto('/panel/garage');
    await expect(garagePage.myProfileButton).toBeVisible();

    await use(garagePage);
  },
});

export { expect };
