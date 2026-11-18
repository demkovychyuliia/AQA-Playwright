import { test, expect } from '@playwright/test';
import { GaragePage } from '../pages/GaragePage';

test('should display mocked user profile data', async ({ page }) => {
  const garagePage = new GaragePage(page);

  // Mock API response
  const mockedProfile = {
    status: 'ok',
    data: {
      userId: 123456,
      photoFilename: 'default-user.png',
      name: 'MockFirstName',
      lastName: 'MockLastName',
    },
  };

  // Intercept GET /api/users/profile
  await page.route('**/api/users/profile', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockedProfile),
    });
  });

  // Open Garage page
  await page.goto('/panel/garage');

  await expect(garagePage.myProfileButton).toBeVisible();

  // Start waiting for the profile API response before navigation
  const profileResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes('/api/users/profile') &&
      response.request().method() === 'GET'
    );
  });

  // Navigate to Profile page
  await garagePage.openProfile();

  // Verify API response
  const profileResponse = await profileResponsePromise;

  expect(profileResponse.status()).toBe(200);

  const responseBody = await profileResponse.json();

  expect(responseBody).toEqual(mockedProfile);

  // Verify mocked data displayed on the UI
  await expect(
    page.getByText('MockFirstName MockLastName', { exact: true }),
  ).toBeVisible();
});

