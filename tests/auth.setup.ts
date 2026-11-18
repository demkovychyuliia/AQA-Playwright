import { test as setup, expect } from '@playwright/test';
import path from 'node:path';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { getEnv } from '../utils/env';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);

  await homePage.open();
  await homePage.signInButton.click();

  await expect(loginPage.heading).toBeVisible();

  await loginPage.login(
    getEnv('USER_EMAIL'),
    getEnv('USER_PASSWORD'),
  );

  await expect(page).toHaveURL(/\/panel\/garage/);

  await page.context().storageState({ path: authFile });
});
