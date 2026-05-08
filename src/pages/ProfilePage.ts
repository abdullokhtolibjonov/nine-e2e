import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { CompanyDetails, AccountDetails } from "../types/company.types";

export class ProfilePage extends BasePage {
    public profileDropdown: Locator;
    public profileButton: Locator;
    public editCompanyDetailsButton: Locator;

    public companyNameInput: Locator;
    public selectCountryDropdown: Locator;
    public paymentMethodDropdown: Locator;
    public numberOfEmployeesInput: Locator;
    public saveButton: Locator;

    public readonly companyName: Locator;
    public readonly numberOfEmployees: Locator;

    public editAccountDetailsButton: Locator;
    public firstNameInput: Locator;
    public lastNameInput: Locator;
    public industryDropdown: Locator;
    public saveAccountDetailsButton: Locator;

    public readonly fullName: Locator;
    public readonly industry: Locator;

    public resetPasswordButton: Locator;
    public oldPasswordInput: Locator;
    public newPasswordInput: Locator;
    public confirmNewPasswordInput: Locator;
    public setPasswordButton: Locator;

    public gotItButton: Locator;
    public passwordResetSuccessMessage: Locator;
    public autoLogoutBackLink: Locator;

    constructor(page: Page) {
        super(page);

        this.profileDropdown = page.locator('.account-dropdown');
        this.profileButton = page.locator('[data-element="top-profile-btn"]');
        this.editCompanyDetailsButton = page.locator('[data-element="edit-company-details-button"]');
        this.editAccountDetailsButton = page.locator('[data-element="edit-account-details-button"]');

        this.companyNameInput = page.locator('[data-element="company_name"]');
        this.selectCountryDropdown = page.locator('input[name="country"]');
        this.paymentMethodDropdown = page.locator('[data-element="base-select-payment-methods"]');
        this.numberOfEmployeesInput = page.locator('[data-element="base-select-number_of_employees"]');
        this.saveButton = page.locator('[data-element="edit-company-modal-save-btn"]');

        this.companyName = page.locator('.details-list dt:has-text("Company name:") + dd');
        this.numberOfEmployees = page.locator('.details-list dt:has-text("Number of Employees") + dd');

        this.firstNameInput = page.locator('[data-element="first_name"]');
        this.lastNameInput = page.locator('[data-element="last_name"]');
        this.industryDropdown = page.locator('[data-element="base-select-industry_name"]');
        this.saveAccountDetailsButton = page.locator('[data-element="edit-user-modal-save-btn"]');

        this.fullName = page.locator('dt:text("Full Name:") + dd');
        this.industry = page.locator('dt:text("Industry:") + dd');

        this.resetPasswordButton = page.locator('[data-element="reset-password"]');
        this.oldPasswordInput = page.locator('[data-element="old_password"]');
        this.newPasswordInput = page.locator('[data-element="password"]');
        this.confirmNewPasswordInput = page.locator('[data-element="password_confirmation"]');
        this.setPasswordButton = page.locator('[data-element="reset-password-form-submit-btn"]');

        this.gotItButton = page.locator('[data-element="reset-password-got-btn"]');
        this.passwordResetSuccessMessage = page.locator('.bill-dialog__body p');
        this.autoLogoutBackLink = page.locator('[data-element="link-sign-up-login-layout-backlink"]');

    }

    async selectEmployeesCount(option: string): Promise<void> {
        await this.page.locator('ul.el-select-dropdown__list li span')
        .filter({ hasText: option })
        .click();
    }
    async verifyCompanyDetails(page: ProfilePage, expected: CompanyDetails): Promise<void> {
        await expect(page.companyName).toHaveText(expected.companyName);
        await expect(page.numberOfEmployees).toHaveText(expected.employees);
    }
    async selectIndustry(option: string): Promise<void> {
        await this.page.locator('li.el-select-dropdown__item span')
        .filter({ hasText: option })
        .click();
    }
    async verifyAccountDetails(page: ProfilePage, expected: AccountDetails): Promise<void> {
        await expect(page.fullName).toHaveText(expected.fullName);
        await expect(page.industry).toHaveText(expected.industry);
    }
}