import { expect, type Page } from '@playwright/test';
import { parsePrice, sumPrices } from '../utils/priceUtils';

export class CheckoutStepTwoPage {
  readonly page: Page;
  readonly title;
  readonly productNames;
  readonly productPrices;
  readonly itemTotalLabel;
  readonly taxLabel;
  readonly totalLabel;
  readonly cancelButton;
  readonly finishButton;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.productNames = page.locator('.cart_item .inventory_item_name');
    this.productPrices = page.locator('.cart_item .inventory_item_price');
    this.itemTotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  async expectCheckoutStepTwoVisible() {
    await expect(this.title).toHaveText('Checkout: Overview');
  }

  async expectProductsVisible(productNames: string[]) {
    const actual = await this.productNames.allTextContents();
    await expect(actual).toEqual(productNames);
  }

  async expectIndividualPricesVisible() {
    const prices = await this.productPrices.allTextContents();
    for (const price of prices) {
      await expect(price).toMatch(/\$\d+\.\d{2}/);
    }
  }

  async expectItemTotalMatchesProductSum() {
    const prices = await this.productPrices.allTextContents();
    const totalSum = sumPrices(prices);
    const labelText = await this.itemTotalLabel.textContent();
    const reported = parsePrice(labelText || '0');
    await expect(reported).toBeCloseTo(totalSum, 2);
  }

  async expectTaxVisible() {
    await expect(this.taxLabel).toBeVisible();
  }

  async expectTotalVisible() {
    await expect(this.totalLabel).toBeVisible();
  }

  async expectTotalPrice(expectedTotal: string) {
    await expect(this.totalLabel).toContainText(expectedTotal);
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }
}
