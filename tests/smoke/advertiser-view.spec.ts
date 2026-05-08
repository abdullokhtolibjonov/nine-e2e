import { test, expect } from '@fixtures/index';
import { faker } from '@faker-js/faker';
import { AwsSecrets, getLocalSecretsIfExists } from '@helpers/getAwsParameters';
let secrets: AwsSecrets;

test.describe('Advertiser profile', () => {
  test.use({ storageState: '.auth/advertiser.json' });

  test('Advertiser is able to edit company details', async ({ profilePage }) => {
    const employeeOptions = ['Solo trader', '1 - 4 employees', '5 - 19 employees', '20 - 199 employees'];
    const newCompanyName = faker.company.name();
    const newEmployeeCount = faker.helpers.arrayElement(employeeOptions);

    const updatedDetails = {
      companyName: newCompanyName,
      employees: newEmployeeCount,
    };

    await profilePage.navigateTo('/');
    await profilePage.profileDropdown.click();
    await profilePage.profileButton.click();

    await profilePage.editCompanyDetailsButton.click();

    await profilePage.companyNameInput.clear();
    await profilePage.companyNameInput.fill(updatedDetails.companyName);

    await profilePage.numberOfEmployeesInput.click();
    await profilePage.selectEmployeesCount(updatedDetails.employees);

    await profilePage.saveButton.click();

    await profilePage.verifyCompanyDetails(profilePage, updatedDetails);
  });

  test('Advertiser is able to edit account details', async ({ profilePage }) => {
    const industryOptions = ['Business', 'Automotive', 'Education', 'Finance', 'FMCG', 'Funeral Directors', 'Charity / Foundation', 'Energy / Utilities'];
    const newFirstName = faker.person.firstName();
    const newLastName = faker.person.lastName();
    const newFullName = `${newFirstName} ${newLastName}`;
    const newIndustry = faker.helpers.arrayElement(industryOptions);

    const updatedDetails = {
      fullName: newFullName,
      industry: newIndustry,
    };
    
    await profilePage.navigateTo('/');
    await profilePage.profileDropdown.click();
    await profilePage.profileButton.click();

    await profilePage.editAccountDetailsButton.click();

    await profilePage.firstNameInput.clear();
    await profilePage.firstNameInput.fill(newFirstName);

    await profilePage.lastNameInput.clear();
    await profilePage.lastNameInput.fill(newLastName);

    await profilePage.industryDropdown.click();
    await profilePage.selectIndustry(newIndustry);

    await profilePage.saveAccountDetailsButton.click();

    await profilePage.verifyAccountDetails(profilePage, updatedDetails);
  });

  test.describe('Reset password', () => {
    test.use({ storageState: '.auth/advertiser2.json' });

    const tempPassword = 'Password123@';

    test.beforeAll(async () => {
      secrets = await getLocalSecretsIfExists();
    });

    test('Advertiser can reset the password using Reset password button under Account details', async ({ profilePage, loginPage }) => {
      await profilePage.navigateTo('/');
      await profilePage.profileDropdown.click();
      await profilePage.profileButton.click();

      await profilePage.resetPasswordButton.click();

      await profilePage.oldPasswordInput.fill(secrets.ADVERTISER2_PASSWORD);
      await profilePage.newPasswordInput.fill(tempPassword);
      await profilePage.confirmNewPasswordInput.fill(tempPassword);

      await profilePage.setPasswordButton.click();

      // After password change either the success modal or the auto-logout modal appears first
      await Promise.race([
        profilePage.autoLogoutBackLink.waitFor({ state: 'visible' }),
        profilePage.gotItButton.waitFor({ state: 'visible' }),
      ]);

      if (await profilePage.autoLogoutBackLink.isVisible()) {
        await profilePage.autoLogoutBackLink.click();
      } else {
        await expect(profilePage.passwordResetSuccessMessage).toContainText('Password was successfully updated.');
        await profilePage.gotItButton.click();
      }

      // Verify old password no longer works
      await loginPage.attemptLoginToCore(secrets.ADVERTISER2_LOGIN, secrets.ADVERTISER2_PASSWORD, '/login');
      await expect(profilePage.page).not.toHaveURL(/storefront/);

      await loginPage.loginToCore(secrets.ADVERTISER2_LOGIN, tempPassword, '/login');
      await expect(profilePage.page).toHaveURL(/dashboard|storefront/);

      const cookies = await profilePage.page.context().cookies();
      const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      const xsrfToken = cookies.find(
        c => c.name === 'XSRF-TOKEN' && c.domain.includes('self-service.danads.com'),
      )?.value ?? '';

      const res = await profilePage.page.request.post('https://nin-stage.self-service.danads.com/api/users/reset-password', {
        headers: {
          Cookie: cookieString,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: 'https://nin-stage.self-service.danads.com',
          Referer: 'https://nin-stage.self-service.danads.com/profile',
          'x-xsrf-token': decodeURIComponent(xsrfToken),
        },
        data: {
          old_password: tempPassword,
          password: secrets.ADVERTISER2_PASSWORD,
          password_confirmation: secrets.ADVERTISER2_PASSWORD,
          token: '',
          id: '',
          email: '',
          captcha: '',
          valid: '',
        },
      });

      await expect(res.status()).toBe(200);
    });
  });
});
