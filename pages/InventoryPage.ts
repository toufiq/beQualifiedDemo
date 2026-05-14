import { expect, type Page } from '@playwright/test';
import { isRightAligned } from '../utils/visualUtils';

const sortValueMapping: Record<string, string> = {
  'Name A to Z': 'az',
  'Name Z to A': 'za',
  'Price low to high': 'lohi',
  'Price high to low': 'hilo'
};

export class InventoryPage {
  readonly page: Page;
  readonly title;
  readonly inventoryItems;
  readonly sortSelect;
  readonly cartBadge;
  readonly cartIcon;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortSelect = page.locator('.product_sort_container');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartIcon = page.locator('.shopping_cart_link');
  }

  async expectProductsPageVisible() {
    await expect(this.title).toHaveText('Products');
  }

  async expectAllProductsHaveImagePriceAndAddToCartButton() {
    await expect(this.inventoryItems).toHaveCount(6);
    for (let index = 0; index < 6; index++) {
      const item = this.inventoryItems.nth(index);
      await expect(item.locator('.inventory_item_img img')).toBeVisible();
      await expect(item.locator('.inventory_item_price')).toBeVisible();
      await expect(item.locator('button')).toHaveText(/Add to cart/i);
    }
  }

  async addProduct(productName: string) {
    const card = this.inventoryItems.filter({ has: this.page.locator('.inventory_item_name', { hasText: productName }) });
    await card.locator('button').first().click();
  }

  async addFirstNProducts(count: number) {
    for (let index = 0; index < count; index++) {
      await this.inventoryItems.nth(index).locator('button').click();
    }
  }

  async removeProduct(productName: string) {
    const card = this.inventoryItems.filter({ has: this.page.locator('.inventory_item_name', { hasText: productName }) });
    await card.locator('button').first().click();
  }

  async expectCartBadgeCount(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async expectCartBadgeHidden() {
    await expect(this.cartBadge).toHaveCount(0);
  }

  async openProductDetails(productName: string) {
    const card = this.inventoryItems.filter({ has: this.page.locator('.inventory_item_name', { hasText: productName }) });
    await card.locator('.inventory_item_name').click();
  }

  async goToCart() {
    await this.cartIcon.click();
  }

  async sortBy(option: string) {
    await this.sortSelect.selectOption(sortValueMapping[option] ?? option);
  }

  async expectSortingByNameAsc() {
    const names = await this.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    await expect(names).toEqual(sorted);
  }

  async expectSortingByNameDesc() {
    const names = await this.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    await expect(names).toEqual(sorted);
  }

  async expectSortingByPriceLowToHigh() {
    const prices = await this.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    await expect(prices).toEqual(sorted);
  }

  async expectSortingByPriceHighToLow() {
    const prices = await this.getProductPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    await expect(prices).toEqual(sorted);
  }

  async getProductNames(): Promise<string[]> {
    return this.inventoryItems.locator('.inventory_item_name').allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const prices = await this.inventoryItems.locator('.inventory_item_price').allTextContents();
    return prices.map((text) => parseFloat(text.replace(/[^0-9.]/g, '')));
  }

  async getProductImages(): Promise<string[]> {
    return this.inventoryItems.locator('.inventory_item_img img').evaluateAll((elements) => elements.map((el) => (el as HTMLImageElement).src));
  }

  async refreshPage() {
    await this.page.reload();
  }

  async expectCartIconRightAlignedWithSortDropdown() {
    const cartBox = await this.cartIcon.boundingBox();
    const sortBox = await this.sortSelect.boundingBox();
    await expect(isRightAligned(sortBox, cartBox)).toBeTruthy();
  }
}
