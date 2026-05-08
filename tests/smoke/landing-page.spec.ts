import { test, expect } from '@fixtures/index';
import { authenticateInCognito } from '@helpers/auth';
import { AwsSecrets } from '@helpers/getAwsParameters';
import { getLocalSecretsIfExists } from '@helpers/getAwsParameters';

let secrets: AwsSecrets;
test.beforeAll(async () => {
    secrets = await getLocalSecretsIfExists();
});

test.describe('Registration', () => {
    test('Registration form is opened after clicking on "Get Started" button', async ({ registrationPage }) => {
        await registrationPage.navigateTo(`${secrets.BASE_URL}`);
        await authenticateInCognito(registrationPage.page, secrets.COGNITO_LOGIN, secrets.COGNITO_PASSWORD, secrets.BASE_URL);
        await registrationPage.getStartedButton.click();

        await expect(registrationPage.page).toHaveURL(/sign-up\/with-email/);
        await expect(registrationPage.emailInput).toBeVisible();
        await expect(registrationPage.RegisterButton).toBeVisible();

    });
});

test.describe('Legal links on Landing page', () => {
    test.beforeEach(async ({ registrationPage }) => {
        await registrationPage.navigateTo(`${secrets.BASE_URL}`);
        await authenticateInCognito(registrationPage.page, secrets.COGNITO_LOGIN, secrets.COGNITO_PASSWORD, secrets.BASE_URL);
    });

    test('"Terms and Conditions" link opens PDF document in a new tab', async ({ registrationPage }) => {
        await expect(registrationPage.termsAndConditionsLink).toBeVisible();

        const [newTab] = await Promise.all([
            registrationPage.page.waitForEvent('popup'),
            registrationPage.termsAndConditionsLink.click(),
        ]);
        await newTab.waitForLoadState();
        await expect(newTab).toHaveURL(
            'https://www.nineforbrands.com.au/wp-content/uploads/2023/05/Nine-consolidated-tcs-2023.pdf'
        );
    });

    test('"Privacy Policy" link leads to privacy policy page in a new tab', async ({ registrationPage }) => {
        await expect(registrationPage.privacyPolicyLink).toBeVisible();

        const [newTab] = await Promise.all([
            registrationPage.page.waitForEvent('popup'),
            registrationPage.privacyPolicyLink.click(),
        ]);
        await newTab.waitForLoadState();
        await expect(newTab).toHaveURL('https://login.nine.com.au/privacy');
    });
});