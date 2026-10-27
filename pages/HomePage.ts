import { type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly signInButton: Locator;
  readonly registrationButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.registrationButton = page.getByRole('button', {
      name: 'Registration',
    });
  }

  async open() {
    await this.page.goto('/');
  }

  async openRegistration() {
    await this.signInButton.click();
    await this.registrationButton.click();
  }
}