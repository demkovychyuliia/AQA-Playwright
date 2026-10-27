import { type Page, type Locator } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly repeatPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Registration' });

    this.nameInput = page.locator('#signupName');
    this.lastNameInput = page.locator('#signupLastName');
    this.emailInput = page.locator('#signupEmail');
    this.passwordInput = page.locator('#signupPassword');
    this.repeatPasswordInput = page.locator('#signupRepeatPassword');

    this.registerButton = page.getByRole('button', {
      name: 'Register',
      exact: true,
    });

    this.closeButton = page.getByRole('button', { name: 'Close' });
  }

  async fillRegistrationForm({
    name,
    lastName,
    email,
    password,
    repeatPassword,
  }: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    repeatPassword: string;
  }) {
    await this.nameInput.fill(name);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.repeatPasswordInput.fill(repeatPassword);
  }

  async register() {
    await this.registerButton.click();
  }

  async close() {
    await this.closeButton.click();
  }
}