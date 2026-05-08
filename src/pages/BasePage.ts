import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
    public termsAndConditionsLink: Locator;
    public privacyPolicyLink: Locator;

    constructor(public readonly page: Page) {
        this.termsAndConditionsLink = this.page.locator('a[href*="Nine-consolidated-tcs-2023.pdf"]');
        this.privacyPolicyLink = this.page.locator('a[href*="login.nine.com.au/privacy"]');
    }

    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
    }
    
    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    async toHaveURL(pattern: string | RegExp): Promise<void> {
        await expect(this.page).toHaveURL(pattern);
    }
}