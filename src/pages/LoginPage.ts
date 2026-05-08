import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { AwsSecrets, getLocalSecretsIfExists } from "@helpers/getAwsParameters";

export class LoginPage extends BasePage {
    private usernameInput: Locator;
    private passwordInput: Locator;
    private loginButton: Locator;
    private errorMessage: Locator;
    getStartedButton: Locator;
    secrets: Promise<AwsSecrets>;

    public emailInput: Locator;
    public logInWithEmailButton: Locator;
    public corePasswordInput: Locator;
    public submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = this.page.locator('#username');
        this.passwordInput = this.page.locator('#password');
        this.loginButton = this.page.locator('#login-button');
        this.errorMessage = this.page.locator('.error-message');
        this.getStartedButton = this.page.locator('#get-started-button');
        this.secrets = getLocalSecretsIfExists();

        this.emailInput = this.page.locator('[name="email"]');
        this.logInWithEmailButton = this.page.locator('//button[contains(., "Log in with email")]');
        this.corePasswordInput = this.page.locator('[name="password"]');
        this.submitButton = this.page.locator('//button[contains(., "Submit")]');
    }

    async goto(url?: string): Promise<void> {
        this.navigateTo(`/${url}`);
    }

    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async attemptLoginToCore(email: string, password: string, url: string): Promise<void> {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await this.emailInput.fill(email);
        await this.page.waitForTimeout(500);

        if (await this.logInWithEmailButton.isVisible()) {
            await this.logInWithEmailButton.click();
        }

        await this.corePasswordInput.waitFor({ state: 'visible' });
        await this.corePasswordInput.fill(password);
        await this.submitButton.click();
    }

    async loginToCore(email: string, password: string, url: string): Promise<void> {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await this.emailInput.fill(email);
        await this.page.waitForTimeout(500);

        if (await this.logInWithEmailButton.isVisible()) {
            await this.logInWithEmailButton.click();
        }

        await this.corePasswordInput.waitFor({ state: 'visible' });
        await this.corePasswordInput.fill(password);
        await this.submitButton.click();

        await this.page.waitForURL(/dashboard|campaign|storefront/gm, {
            waitUntil: 'domcontentloaded',
            timeout: 30_000,
        });
    }

    async assertErrorVisible(message?: string): Promise<void> {
        await expect(this.errorMessage).toBeVisible();
        if (message) await expect(this.errorMessage).toHaveText(message);
    }
}