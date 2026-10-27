import { test, expect, type Locator, type Page } from '@playwright/test';
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
    page: Page,
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
    await page.locator('#signupName').fill(name);
    await page.locator('#signupLastName').fill(lastName);
    await page.locator('#signupEmail').fill(email);
    await page.locator('#signupPassword').fill(password);
    await page.locator('#signupRepeatPassword').fill(repeatPassword);
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

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Registration' }).click();
    await expect(
      page.getByRole('heading', { name: 'Registration' }),
    ).toBeVisible();
  });

  // FORM DISPLAY

  test('should display registration form fields', async ({ page }) => {
    await expect(page.locator('#signupName')).toBeVisible();
    await expect(page.locator('#signupLastName')).toBeVisible();
    await expect(page.locator('#signupEmail')).toBeVisible();
    await expect(page.locator('#signupPassword')).toBeVisible();
    await expect(page.locator('#signupRepeatPassword')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeVisible();
  });

  test('should display required errors for empty fields', async ({
    page,
  }) => {
    const nameField = page.locator('#signupName');
    const lastNameField = page.locator('#signupLastName');
    const emailField = page.locator('#signupEmail');
    const passwordField = page.locator('#signupPassword');
    const repeatPasswordField = page.locator('#signupRepeatPassword');
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
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  // NAME VALIDATION

  test('should require Name', async ({ page }) => {
    const field = await fillAndBlurField(page.locator('#signupName'), '');
    await expectInvalidField(page, field, 'Name required');
  });

  test('should reject Name shorter than 2 characters', async ({ page }) => {
    const field = await fillAndBlurField(page.locator('#signupName'), 'A');
    await expectInvalidField(
      page,
      field,
      'Name has to be from 2 to 20 characters long',
    );
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should accept Name with 2 characters', async ({ page }) => {
    const field = await fillAndBlurField(page.locator('#signupName'), 'An');
    await expectValidField(page, field);
  });

  test('should accept Name with 20 characters', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupName'),
      'A'.repeat(20),
    );
    await expectValidField(page, field);
  });

  test('should reject Name longer than 20 characters', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupName'),
      'A'.repeat(21),
    );
    await expectInvalidField(
      page,
      field,
      'Name has to be from 2 to 20 characters long',
    );
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Name containing numbers', async ({ page }) => {
    const field = await fillAndBlurField(page.locator('#signupName'), 'Anna123');
    await expectInvalidField(page, field, 'Name is invalid');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Name containing special characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(page.locator('#signupName'), 'Anna@');
    await expectInvalidField(page, field, 'Name is invalid');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Name containing non-English characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupName'),
      'Анна',
    );
    await expectInvalidField(page, field, 'Name is invalid');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should ignore leading and trailing spaces in Name', async ({
    page,
  }) => {
    const field = await fillAndBlurField(page.locator('#signupName'), ' Anna ');
    await expectValidField(page, field);
  });

  test('should treat spaces-only Name as required', async ({ page }) => {
    const field = await fillAndBlurField(page.locator('#signupName'), '   ');
    await expectInvalidField(page, field, 'Name required');
  });

  test('should validate Name length after trimming spaces', async ({
    page,
  }) => {
    const field = await fillAndBlurField(page.locator('#signupName'), ' A ');
    await expectInvalidField(
      page,
      field,
      'Name has to be from 2 to 20 characters long',
    );
  });

  // LAST NAME VALIDATION

  test('should require Last Name', async ({ page }) => {
    const field = await fillAndBlurField(page.locator('#signupLastName'), '');
    await expectInvalidField(page, field, 'Last name required');
  });

  test('should reject Last Name shorter than 2 characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(page.locator('#signupLastName'), 'S');
    await expectInvalidField(
      page,
      field,
      'Last name has to be from 2 to 20 characters long',
    );
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should accept Last Name with 2 characters', async ({ page }) => {
    const field = await fillAndBlurField(page.locator('#signupLastName'), 'Sm');
    await expectValidField(page, field);
  });

  test('should accept Last Name with 20 characters', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupLastName'),
      'S'.repeat(20),
    );
    await expectValidField(page, field);
  });

  test('should reject Last Name longer than 20 characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupLastName'),
      'S'.repeat(21),
    );
    await expectInvalidField(
      page,
      field,
      'Last name has to be from 2 to 20 characters long',
    );
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Last Name containing numbers', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupLastName'),
      'Smith123',
    );
    await expectInvalidField(page, field, 'Last name is invalid');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Last Name containing special characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupLastName'),
      'Smith@',
    );
    await expectInvalidField(page, field, 'Last name is invalid');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Last Name containing non-English characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupLastName'),
      'Сміт',
    );
    await expectInvalidField(page, field, 'Last name is invalid');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should ignore leading and trailing spaces in Last Name', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupLastName'),
      ' Smith ',
    );
    await expectValidField(page, field);
  });

  test('should treat spaces-only Last Name as required', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupLastName'),
      '   ',
    );
    await expectInvalidField(page, field, 'Last name required');
  });

  test('should validate Last Name length after trimming spaces', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupLastName'),
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
    const field = await fillAndBlurField(page.locator('#signupEmail'), '');
    await expectInvalidField(page, field, 'Email required');
  });

  test('should accept valid Email', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupEmail'),
      generateEmail(),
    );
    await expectValidField(page, field);
  });

  test('should reject Email without @', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupEmail'),
      'annagmail.com',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Email without local part', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupEmail'),
      '@gmail.com',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Email without domain', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupEmail'),
      'anna@',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Email without domain extension', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupEmail'),
      'anna@gmail',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Email with one-character domain extension', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupEmail'),
      'email@gmail.c',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Email containing spaces', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupEmail'),
      'anna smith@gmail.com',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Email with two @ symbols', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupEmail'),
      'anna@@gmail.com',
    );
    await expectInvalidField(page, field, 'Email is incorrect');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should accept Email with subdomain', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupEmail'),
      'anna@mail.example.com',
    );
    await expectValidField(page, field);
  });

  test('should accept Email with plus addressing', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupEmail'),
      'anna+test@gmail.com',
    );
    await expectValidField(page, field);
  });

  // PASSWORD VALIDATION

  test('should require Password', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupPassword'),
      '',
    );
    await expectInvalidField(page, field, 'Password required');
  });

  test('should reject Password shorter than 8 characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupPassword'),
      'Test123',
    );
    await expectInvalidField(page, field, passwordError);
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should accept Password with 8 characters', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupPassword'),
      'Test1234',
    );
    await expectValidField(page, field);
  });

  test('should accept Password with 15 characters', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupPassword'),
      'Testpassword123',
    );
    await expectValidField(page, field);
  });

  test('should reject Password longer than 15 characters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupPassword'),
      'Testpassword1234',
    );
    await expectInvalidField(page, field, passwordError);
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Password without uppercase letters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupPassword'),
      'testpass123',
    );
    await expectInvalidField(page, field, passwordError);
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Password without lowercase letters', async ({
    page,
  }) => {
    const field = await fillAndBlurField(
      page.locator('#signupPassword'),
      'TESTPASS123',
    );
    await expectInvalidField(page, field, passwordError);
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should reject Password without digits', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupPassword'),
      'Abcdefgh',
    );
    await expectInvalidField(page, field, passwordError);
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  // RE-ENTER PASSWORD VALIDATION

  test('should require Re-enter password', async ({ page }) => {
    const field = await fillAndBlurField(
      page.locator('#signupRepeatPassword'),
      '',
    );
    await expectInvalidField(
      page,
      field,
      'Re-enter password required',
    );
  });

  test('should reject mismatching passwords', async ({ page }) => {
    await page.locator('#signupPassword').fill(validUser.password);
    const field = await fillAndBlurField(
      page.locator('#signupRepeatPassword'),
      'Different123',
    );
    await expectInvalidField(page, field, 'Passwords do not match');
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should accept matching passwords', async ({ page }) => {
    await page.locator('#signupPassword').fill(validUser.password);
    const field = await fillAndBlurField(
      page.locator('#signupRepeatPassword'),
      validUser.password,
    );
    await expectValidField(page, page.locator('#signupPassword'));
    await expectValidField(page, field);
  });

  // REGISTER BUTTON

  test('should disable Register button for empty form', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should disable Register button for invalid form', async ({
    page,
  }) => {
    await fillRegistrationForm(page, { name: 'A' });
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeDisabled();
  });

  test('should enable Register button for valid form', async ({
    page,
  }) => {
    await fillRegistrationForm(page);
    await expect(
      page.getByRole('button', { name: 'Register', exact: true }),
    ).toBeEnabled();
  });

  // CLOSE REGISTRATION FORM

  test('should close Registration form', async ({ page }) => {
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(
      page.getByRole('heading', { name: 'Registration' }),
    ).not.toBeVisible();
    await expect(page).toHaveURL('https://qauto.forstudy.space/');
  });

  // SUCCESSFUL REGISTRATION

  test('should register user successfully', async ({ page }) => {
    await fillRegistrationForm(page);
    await page
      .getByRole('button', { name: 'Register', exact: true })
      .click();
    await expect(page).toHaveURL(/\/panel\/garage/);
  });

  test('should register, logout and login with the same credentials', async ({
    page,
  }) => {
    const email = generateEmail();
    const password = validUser.password;

  // Registration
    await fillRegistrationForm(page, {
      email,
      password,
      repeatPassword: password,
    });
    await page
      .getByRole('button', { name: 'Register', exact: true })
      .click();
    await expect(page).toHaveURL(/\/panel\/garage/);

  // Logout
    await page.getByRole('button', { name: 'My profile' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(
      page.getByRole('button', { name: 'Sign In' }),
    ).toBeVisible();
    await expect(page).toHaveURL('https://qauto.forstudy.space/');

  // Login with the same credentials
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(
      page.getByRole('heading', { name: 'Log in' }),
    ).toBeVisible();
    await page.locator('#signinEmail').fill(email);
    await page.locator('#signinPassword').fill(password);
    await page
      .getByRole('button', { name: 'Login', exact: true })
      .click();

  // Verify successful login
    await expect(page).toHaveURL(/\/panel\/garage/);
    await expect(
      page.getByRole('button', { name: 'My profile' }),
    ).toBeVisible();
  });
});
