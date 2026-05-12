import { Page, Locator, expect, Frame, FrameLocator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { CompanyDetails, AccountDetails } from "../types/company.types";
import { LoadFnOutput } from "node:module";

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

    //payment tab
    public paymentTab: Locator;
    public addCardButton: Locator;
    public cardNumberInput: Locator;
    public expiryDateInput: Locator;
    public CVCinput: Locator;
    public cardHolderNameInput: Locator;
    public saveCardModalButton: Locator;
    public confirmCardDeleteButton: Locator;
    public successCardDeleteNotification: Locator;
    public successCardDeleteMessage: Locator;

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

        //payment tab
        this.paymentTab = page.locator('#tab-payment');
        this.addCardButton = page.locator('[data-element="add-card-button"]');
        this.cardNumberInput = page.frameLocator('iframe[title="Secure card number input frame"]').locator('input[name="cardnumber"]');
        this.expiryDateInput = page.frameLocator('iframe[title="Secure expiration date input frame"]').locator('input[name="exp-date"]');
        this.CVCinput = page.frameLocator('iframe[title="Secure CVC input frame"]').locator('input[name="cvc"]');
        this.cardHolderNameInput = page.locator('[name="card_holder_name"]');
        this.saveCardModalButton = page.locator('[data-element="add-card-modal-save-btn"]');
        this.confirmCardDeleteButton = page.locator('[data-element="remove-card-modal-yes-btn"]');
        this.successCardDeleteNotification = page.locator('.el-notification__title', { hasText: 'Success' });
        this.successCardDeleteMessage = page.locator('.el-notification__content p');
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
    
    getCardItem(lastFour: string): Locator {
        return this.page.locator('.payment-method__item').filter({
            has: this.page.locator('.card-number span.text-medium', { hasText: lastFour })
        });
    }

    getCardExpiryDate(lastFour: string): Locator {
        return this.getCardItem(lastFour).locator('.card-expire span');
    }

    async verifyCardLastFourDigits(lastFour: string): Promise<void> {
        await expect(this.getCardItem(lastFour).locator('.card-number span.text-medium')).toContainText(lastFour);
    }

    async verifyCardExpiryDate(lastFour: string, expiryDate: string): Promise<void> {
        await expect(this.getCardExpiryDate(lastFour)).toHaveText(expiryDate);
    }

    getDeleteCardButton(lastFour: string): Locator {
        return this.getCardItem(lastFour).locator('[data-gtm="delete-tooltip-icon-btn"]');
    }

    async deleteCard(lastFour: string): Promise<void> {
        await this.getDeleteCardButton(lastFour).click();
        await this.confirmCardDeleteButton.click();
    }
    async verifyCardAddedMessage(): Promise<void> {
        await expect(this.page.locator('.el-notification__content p', { hasText: 'Credit card was added' })).toBeVisible();
    }

    async verifyCardRemovedMessage(): Promise<void> {
        await expect(this.page.locator('.el-notification__content p', { hasText: 'The card was removed.' })).toBeVisible();
    }
}