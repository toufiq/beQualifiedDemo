import { expect, type Page } from '@playwright/test';

export class CheckoutStepOnePage {
  readonly page: Page;
  readonly firstNameInput;
  readonly lastNameInput;
  readonly postalCodeInput;
  readonly continueButton;
  readonly cancelButton;
  readonly errorMessage;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async expectCheckoutStepOneVisible() {
    await expect(this.page.locator('.title')).toHaveText('Checkout: Your Information');
  }

  async fillFirstName(value: string) {
    await this.firstNameInput.fill(value);
  }

  async fillLastName(value: string) {
    await this.lastNameInput.fill(value);
  }

  async fillPostalCode(value: string) {
    await this.postalCodeInput.fill(value);
  }

  async fillCheckoutInformation(firstName: string, lastName: string, postalCode: string) {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillPostalCode(postalCode);
  }

  async continue() {
    await this.continueButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectLastNameFieldAcceptsValue(value: string) {
    await this.fillLastName(value);
    await expect(this.lastNameInput).toHaveValue(value);
  }
}
