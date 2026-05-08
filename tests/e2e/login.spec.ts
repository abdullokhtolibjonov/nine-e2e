import { test, expect } from '@fixtures/index';
import { createUser } from '@test-data/userFactory';

test.describe('Login flow', () => {
  test('should login with valid credentials', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    const user = createUser();
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await loginPage.assertErrorVisible('Invalid email or password');
  });
});