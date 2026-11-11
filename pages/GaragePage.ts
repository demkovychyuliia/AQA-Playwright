import { type Page, type Locator } from '@playwright/test';

export class GaragePage {
  readonly myProfileButton: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.myProfileButton = page.getByRole('button', {
      name: 'My profile',
    });

    this.profileLink = page.getByRole('link', {
      name: 'Profile',
      exact: true,
    }).first();

    this.logoutButton = page.getByRole('button', {
      name: 'Logout',
    });
  }

  async openProfile() {
    await this.myProfileButton.click();
    await this.profileLink.click();
  }

  async logout() {
    await this.myProfileButton.click();
    await this.logoutButton.click();
  }
}
