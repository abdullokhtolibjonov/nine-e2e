import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class RegistrationPage extends BasePage {
    public getStartedButton: Locator;
    public emailInput: Locator;
    public RegisterButton: Locator;
    constructor(page: Page) {
        super(page);

        this.getStartedButton = this.page.locator('a[href="/sign-up"][data-gtm="landing-hero-get-started-btn"]');
        this.emailInput = this.page.locator('[data-element="email"]');
        this.RegisterButton = this.page.getByRole('button', { name: 'Register' });
    }
}