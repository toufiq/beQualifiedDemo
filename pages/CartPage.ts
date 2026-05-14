import { expect, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly title;
  readonly cartItems;
  readonly cartBadge;
  readonly continueShoppingButton;
  readonly checkoutButton;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async expectCartPageVisible() {
    await expect(this.title).toHaveText('Your Cart');
  }

  async expectProductVisible(productName: string) {
    const item = this.cartItems.filter({ has: this.page.locator('.inventory_item_name', { hasText: productName }) });
    await expect(item).toHaveCount(1);
  }

  async removeProduct(productName: string) {
    const item = this.cartItems.filter({ has: this.page.locator('.inventory_item_name', { hasText: productName }) });
    await item.locator('button').click();
  }

  async expectCartBadgeCount(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async expectCartBadgeHidden() {
    await expect(this.cartBadge).toHaveCount(0);
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }

  async expectCheckoutButtonInsideCartFooter() {
    const footer = this.page.locator('div.cart_footer');
    await expect(footer.locator('[data-test="checkout"]')).toHaveCount(1);
  }
}
