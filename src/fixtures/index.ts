import { test as base, APIRequestContext } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { RegistrationPage } from '@pages/RegistrationPage';
import { BasePage } from '@pages/BasePage';
import { ProfilePage } from '@pages/ProfilePage';

type Pages = {
  basePage: BasePage;
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  profilePage: ProfilePage;
};

// type ApiClients = {
//   authToken: string;
// };


export const test = base.extend<Pages>({
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
});

export { expect } from '@playwright/test';