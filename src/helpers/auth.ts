import { ur } from '@faker-js/faker';
import { Page } from '@playwright/test';

export async function authenticateInCognito(page: Page, username: string, password: string, url: string): Promise<void> {
    await page.goto(url);

    await page.locator('[name="username"]:visible').fill(username);
    await page.locator('[name="password"]:visible').fill(password);
    await page.locator('[name="signInSubmitButton"]:visible').click();
}

export async function authenticateInCore(page: Page, email: string, password: string, url: string): Promise<void> {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.locator('[name="email"]').fill(email);
    await page.waitForTimeout(500);

    const isLoginWithEmailButtonVisible = await page
		.locator('//button[contains(., "Log in with email")]')
		.isVisible();

    if (isLoginWithEmailButtonVisible) {
      await page.locator('//button[contains(., "Log in with email")]').click();
    }
    await page.waitForSelector('[name="password"]', { state: 'visible' });
    await page.locator('[name="password"]').fill(password);
    await page.locator('//button[contains(., "Submit")]').click();
    await page.waitForURL(/dashboard|campaign|storefront/gm, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
}