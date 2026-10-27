import { test, expect, type Locator, type Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { LoginPage } from '../pages/LoginPage';
import { GaragePage } from '../pages/GaragePage';

test.describe('Registration form', () => {
  const validUser = {
    name: 'Anna',
    lastName: 'Smith',
    password: 'Testpass123',
  };
  const passwordError =
    'Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter';
  const generateEmail = () =>
    `aqa-yuliia-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const fillRegistrationForm = async (
    registrationPage: RegistrationPage,
    {
      name = validUser.name,
      lastName = validUser.lastName,
      email = generateEmail(),
      password = validUser.password,
      repeatPassword = password,
    }: {
      name?: string;
      lastName?: string;
      email?: string;
      password?: string;
      repeatPassword?: string;
    } = {},
  ) => {
    await registrationPage.fillRegistrationForm({ name, lastName, email, password, repeatPassword });
  };
  const expectInvalidField = async (
    page: Page,
    field: Locator,
    message: string,
  ) => {
    await expect(field).toHaveCSS('border-color', 'rgb(220, 53, 69)');
    const errorMessage = page
      .locator('.form-group')
      .filter({ has: field })
      .locator('.invalid-feedback');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(message);
  };
  const expectValidField = async (page: Page, field: Locator) => {
    const errorMessage = page
      .locator('.form-group')
      .filter({ has: field })
      .locator('.invalid-feedback');
    await expect(errorMessage).toBeHidden();
  };
  const fillAndBlurField = async (field: Locator, value: string) => {
    await field.fill(value);
    await field.blur();
    return field;
  };
  let homePage: HomePage;
  let registrationPage: RegistrationPage;
  let loginPage: LoginPage;
  let garagePage: GaragePage;
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    registrationPage = new RegistrationPage(page);
    loginPage = new LoginPage(page);
    garagePage = new GaragePage(page);
    await homePage.open();
    await homePage.openRegistration();
    await expect(registrationPage.heading).toBeVisible();
  });


  // FORM DISPLAY
  test('should display registration form fields', async ({ page }) => {
    await expect(registrationPage.nameInput).toBeVisible();
    await expect(registrationPage.lastNameInput).toBeVisible();
    await expect(registrationPage.emailInput).toBeVisible();
    await expect(registrationPage.passwordInput).toBeVisible();
    await expect(registrationPage.repeatPasswordInput).toBeVisible();
    await expect(
      registrationPage.registerButton,
    ).toBeVisible();
  });

  test('should display required errors for empty fields', async ({
    page,
  }) => {
    const nameField = registrationPage.nameInput;
    const lastNameField = registrationPage.lastNameInput;
    const emailField = registrationPage.emailInput;
    const passwordField = registrationPage.passwordInput;
    const repeatPasswordField = registrationPage.repeatPasswordInput;
    await nameField.focus();
    await nameField.blur();
    await lastNameField.focus();
    await lastNameField.blur();
    await emailField.focus();
    await emailField.blur();
    await passwordField.focus();
    await passwordField.blur();
    await repeatPasswordField.focus();
    await repeatPasswordField.blur();
    await expectInvalidField(page, nameField, 'Name required');
    await expectInvalidField(page, lastNameField, 'Last name required');
    await expectInvalidField(page, emailField, 'Email required');
    await expectInvalidField(page, passwordField, 'Password required');
    await expectInvalidField(
      page,
      repeatPasswordField,
      'Re-enter password required',
    );
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });


  // NAME VALIDATION
  test('should require Name', async ({ page }) => {
    const field = await fillAndBlurField(registrationPage.nameInput, '');
    await expectInvalidField(page, field, 'Name required');
  });

  test('should reject Name shorter than 2 characters', async ({ page }) => {
    const field = await fillAndBlurField(registrationPage.nameInput, 'A');
    await expectInvalidField(
      page,
      field,
      'Name has to be from 2 to 20 characters long',
    );
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should accept Name with 2 characters', async ({ page }) => {
    const field = await fillAndBlurField(registrationPage.nameInput, 'An');
    await expectValidField(page, field);
  });

  test('should accept Name with 20 characters', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.nameInput,
      'A'.repeat(20),
    );
    await expectValidField(page, field);
  });

  test('should reject Name longer than 20 characters', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.nameInput,
      'A'.repeat(21),
    );
    await expectInvalidField(
      page,
      field,
      'Name has to be from 2 to 20 characters long',
    );
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Name containing numbers', async ({ page }) => {
    const field = await fillAndBlurField(registrationPage.nameInput, 'Anna123');
    await expectInvalidField(page, field, 'Name is invalid');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Name containing special characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(registrationPage.nameInput, 'Anna@');
    await expectInvalidField(page, field, 'Name is invalid');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Name containing non-English characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.nameInput,
      'Анна',
    );
    await expectInvalidField(page, field, 'Name is invalid');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should ignore leading and trailing spaces in Name', async ({
    page,
  }) => {
    const field = await fillAndBlurField(registrationPage.nameInput, ' Anna ');
    await expectValidField(page, field);
  });

  test('should treat spaces-only Name as required', async ({ page }) => {
    const field = await fillAndBlurField(registrationPage.nameInput, '   ');
    await expectInvalidField(page, field, 'Name required');
  });

  test('should validate Name length after trimming spaces', async ({
    page,
  }) => {
    const field = await fillAndBlurField(registrationPage.nameInput, ' A ');
    await expectInvalidField(
      page,
      field,
      'Name has to be from 2 to 20 characters long',
    );
  });


  // LAST NAME VALIDATION
  test('should require Last Name', async ({ page }) => {
    const field = await fillAndBlurField(registrationPage.lastNameInput, '');
    await expectInvalidField(page, field, 'Last name required');
  });

  test('should reject Last Name shorter than 2 characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(registrationPage.lastNameInput, 'S');
    await expectInvalidField(
      page,
      field,
      'Last name has to be from 2 to 20 characters long',
    );
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should accept Last Name with 2 characters', async ({ page }) => {
    const field = await fillAndBlurField(registrationPage.lastNameInput, 'Sm');
    await expectValidField(page, field);
  });

  test('should accept Last Name with 20 characters', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.lastNameInput,
      'S'.repeat(20),
    );
    await expectValidField(page, field);
  });

  test('should reject Last Name longer than 20 characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.lastNameInput,
      'S'.repeat(21),
    );
    await expectInvalidField(
      page,
      field,
      'Last name has to be from 2 to 20 characters long',
    );
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Last Name containing numbers', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.lastNameInput,
      'Smith123',
    );
    await expectInvalidField(page, field, 'Last name is invalid');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Last Name containing special characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.lastNameInput,
      'Smith@',
    );
    await expectInvalidField(page, field, 'Last name is invalid');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Last Name containing non-English characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.lastNameInput,
      'Сміт',
    );
    await expectInvalidField(page, field, 'Last name is invalid');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should ignore leading and trailing spaces in Last Name', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.lastNameInput,
      ' Smith ',
    );
    await expectValidField(page, field);
  });

  test('should treat spaces-only Last Name as required', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.lastNameInput,
      '   ',
    );
    await expectInvalidField(page, field, 'Last name required');
  });

  test('should validate Last Name length after trimming spaces', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.lastNameInput,
      ' S ',
    );
    await expectInvalidField(
      page,
      field,
      'Last name has to be from 2 to 20 characters long',
    );
  });


  // EMAIL VALIDATION
  test('should require Email', async ({ page }) => {
    const field = await fillAndBlurField(registrationPage.emailInput, '');
    await expectInvalidField(page, field, 'Email required');
  });

  test('should accept valid Email', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.emailInput,
      generateEmail(),
    );
    await expectValidField(page, field);
  });

  test('should reject Email without @', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.emailInput,
      'annagmail.com',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Email without local part', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.emailInput,
      '@gmail.com',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Email without domain', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.emailInput,
      'anna@',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Email without domain extension', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.emailInput,
      'anna@gmail',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Email with one-character domain extension', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.emailInput,
      'email@gmail.c',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Email containing spaces', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.emailInput,
      'anna smith@gmail.com',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Email with two @ symbols', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.emailInput,
      'anna@@gmail.com',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should accept Email with subdomain', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.emailInput,
      'anna@mail.example.com',
    );
    await expectValidField(page, field);
  });

  test('should accept Email with plus addressing', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.emailInput,
      'anna+test@gmail.com',
    );
    await expectValidField(page, field);
  });


  // PASSWORD VALIDATION
  test('should require Password', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.passwordInput,
      '',
    );
    await expectInvalidField(page, field, 'Password required');
  });

  test('should reject Password shorter than 8 characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.passwordInput,
      'Test123',
    );
    await expectInvalidField(page, field, passwordError);
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should accept Password with 8 characters', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.passwordInput,
      'Test1234',
    );
    await expectValidField(page, field);
  });

  test('should accept Password with 15 characters', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.passwordInput,
      'Testpassword123',
    );
    await expectValidField(page, field);
  });

  test('should reject Password longer than 15 characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.passwordInput,
      'Testpassword1234',
    );
    await expectInvalidField(page, field, passwordError);
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Password without uppercase letters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.passwordInput,
      'testpass123',
    );
    await expectInvalidField(page, field, passwordError);
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Password without lowercase letters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      registrationPage.passwordInput,
      'TESTPASS123',
    );
    await expectInvalidField(page, field, passwordError);
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should reject Password without digits', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.passwordInput,
      'Abcdefgh',
    );
    await expectInvalidField(page, field, passwordError);
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });


  // RE-ENTER PASSWORD VALIDATION
  test('should require Re-enter password', async ({ page }) => {
    const field = await fillAndBlurField(
      registrationPage.repeatPasswordInput,
      '',
    );
    await expectInvalidField(
      page,
      field,
      'Re-enter password required',
    );
  });

  test('should reject mismatching passwords', async ({ page }) => {
    await registrationPage.passwordInput.fill(validUser.password);
    const field = await fillAndBlurField(
      registrationPage.repeatPasswordInput,
      'Different123',
    );
    await expectInvalidField(page, field, 'Passwords do not match');
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should accept matching passwords', async ({ page }) => {
    await registrationPage.passwordInput.fill(validUser.password);
    const field = await fillAndBlurField(
      registrationPage.repeatPasswordInput,
      validUser.password,
    );
    await expectValidField(page, registrationPage.passwordInput);
    await expectValidField(page, field);
  });


  // REGISTER BUTTON
  test('should disable Register button for empty form', async ({
    page,
  }) => {
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should disable Register button for invalid form', async ({
    page,
  }) => {
    await fillRegistrationForm(registrationPage, { name: 'A' });
    await expect(
      registrationPage.registerButton,
    ).toBeDisabled();
  });

  test('should enable Register button for valid form', async ({
    page,
  }) => {
    await fillRegistrationForm(registrationPage);
    await expect(
      registrationPage.registerButton,
    ).toBeEnabled();
  });


  // CLOSE REGISTRATION FORM
  test('should close Registration form', async ({ page }) => {
    await registrationPage.close();
    await expect(
      registrationPage.heading,
    ).not.toBeVisible();
    await expect(page).toHaveURL('https://qauto.forstudy.space/');
  });


  // SUCCESSFUL REGISTRATION
  test('should register user successfully', async ({ page }) => {
    await fillRegistrationForm(registrationPage);
    await registrationPage.register();
    await expect(page).toHaveURL(/\/panel\/garage/);
  });

  test('should register, logout and login with the same credentials', async ({
    page,
  }) => {
    const email = generateEmail();
    const password = validUser.password;

    // Registration
    await fillRegistrationForm(registrationPage, {
      email,
      password,
      repeatPassword: password,
    });
    await registrationPage.register();
    await expect(page).toHaveURL(/\/panel\/garage/);

    // Logout
    await garagePage.logout();
    await expect(
      homePage.signInButton,
    ).toBeVisible();
    await expect(page).toHaveURL('https://qauto.forstudy.space/');

    // Login with the same credentials
    await homePage.signInButton.click();
    await expect(loginPage.heading).toBeVisible();
    await loginPage.login(email, password);
    
    // Verify successful login
    await expect(page).toHaveURL(/\/panel\/garage/);
    await expect(
      garagePage.myProfileButton,
    ).toBeVisible();
  });
});