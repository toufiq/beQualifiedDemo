import { test, expect } from '../fixtures/testFixtures';
import { users } from '../test-data/users';
import { products } from '../test-data/products';
import { attachJson, attachText } from '../utils/allureUtils';

const capturePrices = async (inventoryPage: any) => ({
  names: await inventoryPage.getProductNames(),
  prices: await inventoryPage.getProductPrices()
});

test.describe('Visual user defects', () => {
  test('should expose changing product prices on inventory refresh', async ({ loginPage, inventoryPage }, testInfo) => {
    test.fail(true, 'Known visual defect: visual_user inventory prices change after refresh');
    await loginPage.goto();
    await loginPage.login('visual_user', users.visual_user);
    const before = await capturePrices(inventoryPage);
    await inventoryPage.refreshPage();
    const after = await capturePrices(inventoryPage);
    await attachJson(testInfo, 'prices-before-refresh', before);
    await attachJson(testInfo, 'prices-after-refresh', after);
    await expect(before.prices).toEqual(after.prices);
  });

  test('should expose price mismatch between inventory and cart', async ({ loginPage, inventoryPage, cartPage }, testInfo) => {
    test.fail(true, 'Known visual defect: visual_user product price changes between inventory and cart');
    await loginPage.goto();
    await loginPage.login('visual_user', users.visual_user);
    const inventoryPrice = await inventoryPage.inventoryItems.filter({ has: inventoryPage.page.locator('.inventory_item_name', { hasText: products[0] }) }).locator('.inventory_item_price').textContent();
    await inventoryPage.addProduct(products[0]);
    await inventoryPage.goToCart();
    const cartPrice = await cartPage.page.locator('.cart_item .inventory_item_price').textContent();
    await attachText(testInfo, 'inventory-price', inventoryPrice || '');
    await attachText(testInfo, 'cart-price', cartPrice || '');
    await expect(cartPrice).toBe(inventoryPrice);
  });

  test('should expose cart icon alignment defect', async ({ loginPage, inventoryPage }, testInfo) => {
    test.fail(true, 'Known visual defect: visual_user cart icon is not right aligned with sort dropdown');
    await loginPage.goto();
    await loginPage.login('visual_user', users.visual_user);
    const sortBox = await inventoryPage.sortSelect.boundingBox();
    const cartBox = await inventoryPage.cartIcon.boundingBox();
    await attachJson(testInfo, 'layout-boxes', { sortBox, cartBox });
    await inventoryPage.expectCartIconRightAlignedWithSortDropdown();
  });

  test('should verify checkout button placement in cart footer', async ({ loginPage, inventoryPage, cartPage }, testInfo) => {
    await loginPage.goto();
    await loginPage.login('visual_user', users.visual_user);
    await inventoryPage.addProduct(products[0]);
    await inventoryPage.goToCart();
    await attachText(testInfo, 'cart-url', cartPage.page.url());
    await cartPage.expectCheckoutButtonInsideCartFooter();
  });
});
