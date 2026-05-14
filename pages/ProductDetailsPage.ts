import { expect, type Page } from '@playwright/test';

export class ProductDetailsPage {
  readonly page: Page;
  readonly productTitle;
  readonly productPrice;
  readonly addToCartButton;
  readonly removeFromCartButton;
  readonly backButton;
  readonly cartBadge;

  constructor(page: Page) {
    this.page = page;
    this.productTitle = page.locator('.inventory_details_name');
    this.productPrice = page.locator('.inventory_details_price');
    this.addToCartButton = page.locator('button:has-text("Add to cart")');
    this.removeFromCartButton = page.locator('button:has-text("Remove")');
    this.backButton = page.locator('#back-to-products');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async expectProductDetails(productName: string) {
    await expect(this.productTitle).toHaveText(productName);
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async removeFromCart() {
    await this.removeFromCartButton.click();
  }

  async expectCartBadgeCount(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async backToProducts() {
    await this.backButton.click();
  }

  async expectUrlContainsInventoryItem() {
    await expect(this.page).toHaveURL(/inventory-item.html/);
  }
}
