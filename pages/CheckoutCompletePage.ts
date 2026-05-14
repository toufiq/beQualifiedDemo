import { expect, type Page } from '@playwright/test';

export class CheckoutCompletePage {
  readonly page: Page;
  readonly completeHeader;
  readonly thankYouMessage;

  constructor(page: Page) {
    this.page = page;
    this.completeHeader = page.locator('.complete-header');
    this.thankYouMessage = page.locator('.complete-text');
  }

  async expectOrderComplete() {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }

  async expectThankYouMessage() {
    await expect(this.thankYouMessage).toContainText('Your order has been dispatched, and will arrive just as fast as the pony can get there!');
  }
}
