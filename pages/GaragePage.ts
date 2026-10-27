import { type Page, type Locator } from '@playwright/test';

export class GaragePage {
  readonly myProfileButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.myProfileButton = page.getByRole('button', {
      name: 'My profile',
    });

    this.logoutButton = page.getByRole('button', {
      name: 'Logout',
    });
  }

  async logout() {
    await this.myProfileButton.click();
    await this.logoutButton.click();
  }
}