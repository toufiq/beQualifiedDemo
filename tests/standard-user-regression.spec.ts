import { test, expect } from '../fixtures/testFixtures';
import { users } from '../test-data/users';
import { checkoutData } from '../test-data/checkoutData';
import { products } from '../test-data/products';
import { attachJson } from '../utils/allureUtils';
import { parsePrice, sumPrices } from '../utils/priceUtils';

const selectedProducts = [products[0], products[1], products[2]];

test.describe('Standard user regression', () => {
  test('should login and verify Products page', async ({ loginPage, inventoryPage }, testInfo) => {
    await test.step('Open login page and authenticate', async () => {
      await loginPage.goto();
      await loginPage.login('standard_user', users.standard_user);
    });

    await test.step('Verify products page is visible', async () => {
      await inventoryPage.expectProductsPageVisible();
      await attachJson(testInfo, 'current-url', { url: loginPage.page.url() });
    });
  });

  test('should verify all products display image, price and add-to-cart button', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', users.standard_user);
    await inventoryPage.expectAllProductsHaveImagePriceAndAddToCartButton();
  });

  test('should add three products and verify cart badge count', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', users.standard_user);
    await inventoryPage.addFirstNProducts(3);
    await inventoryPage.expectCartBadgeCount(3);
  });

  test('should remove one added product and verify cart updates', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', users.standard_user);
    await inventoryPage.addFirstNProducts(3);
    await inventoryPage.removeProduct(products[1]);
    await inventoryPage.expectCartBadgeCount(2);
    const item = inventoryPage.inventoryItems.filter({ has: inventoryPage.page.locator('.inventory_item_name', { hasText: products[1] }) });
    await expect(item.locator('button')).toHaveText('Add to cart');
  });

  test('should open each product details page and verify title and price', async ({ loginPage, inventoryPage, productDetailsPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', users.standard_user);

    for (const product of products) {
      await test.step(`Open product details for ${product}`, async () => {
        await inventoryPage.openProductDetails(product);
        await productDetailsPage.expectUrlContainsInventoryItem();
        await productDetailsPage.expectProductDetails(product);
        await expect(productDetailsPage.productPrice).toBeVisible();
        await productDetailsPage.addToCart();
        await productDetailsPage.expectCartBadgeCount(1);
        await productDetailsPage.removeFromCart();
        await productDetailsPage.backToProducts();
      });
    }
  });

  test('should verify sorting options in inventory page', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', users.standard_user);

    await inventoryPage.sortBy('Name A to Z');
    await inventoryPage.expectSortingByNameAsc();

    await inventoryPage.sortBy('Name Z to A');
    await inventoryPage.expectSortingByNameDesc();

    await inventoryPage.sortBy('Price low to high');
    await inventoryPage.expectSortingByPriceLowToHigh();

    await inventoryPage.sortBy('Price high to low');
    await inventoryPage.expectSortingByPriceHighToLow();
  });

  test('should navigate to cart and verify cart behavior', async ({ loginPage, inventoryPage, cartPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', users.standard_user);
    await inventoryPage.addProduct(selectedProducts[0]);
    await inventoryPage.addProduct(selectedProducts[1]);
    await inventoryPage.goToCart();

    await cartPage.expectCartPageVisible();
    await cartPage.expectProductVisible(selectedProducts[0]);
    await cartPage.expectProductVisible(selectedProducts[1]);

    await cartPage.removeProduct(selectedProducts[0]);
    await cartPage.expectCartBadgeCount(1);
    await cartPage.continueShopping();
    await inventoryPage.expectProductsPageVisible();
  });

  test('should complete checkout flow for standard user', async ({ loginPage, inventoryPage, cartPage, productDetailsPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }, testInfo) => {
    await loginPage.goto();
    await loginPage.login('standard_user', users.standard_user);
    await inventoryPage.addProduct(selectedProducts[0]);
    await inventoryPage.goToCart();
    await cartPage.expectCartPageVisible();
    await cartPage.checkout();

    await checkoutStepOnePage.expectCheckoutStepOneVisible();
    await checkoutStepOnePage.cancel();
    await cartPage.expectCartPageVisible();

    await cartPage.checkout();
    await checkoutStepOnePage.expectCheckoutStepOneVisible();
    await checkoutStepOnePage.fillCheckoutInformation(checkoutData.firstName, checkoutData.lastName, checkoutData.postalCode);
    await checkoutStepOnePage.continue();

    await checkoutStepTwoPage.expectCheckoutStepTwoVisible();
    const itemNames = await checkoutStepTwoPage.productNames.allTextContents();
    await expect(itemNames).toEqual([selectedProducts[0]]);
    await checkoutStepTwoPage.expectIndividualPricesVisible();
    await checkoutStepTwoPage.expectItemTotalMatchesProductSum();
    await checkoutStepTwoPage.expectTaxVisible();
    await checkoutStepTwoPage.expectTotalVisible();

    const totalText = await checkoutStepTwoPage.totalLabel.textContent();
    await attachJson(testInfo, 'checkout-total', { total: totalText });

    await checkoutStepTwoPage.cancel();
    await inventoryPage.expectProductsPageVisible();

    await inventoryPage.openProductDetails(selectedProducts[0]);
    await productDetailsPage.expectUrlContainsInventoryItem();
    await productDetailsPage.backToProducts();

    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutStepOnePage.fillCheckoutInformation(checkoutData.firstName, checkoutData.lastName, checkoutData.postalCode);
    await checkoutStepOnePage.continue();
    await checkoutStepTwoPage.expectCheckoutStepTwoVisible();
    await checkoutStepTwoPage.finish();
    await checkoutCompletePage.expectOrderComplete();
    await checkoutCompletePage.expectThankYouMessage();
  });

  test('should validate required checkout fields', async ({ loginPage, inventoryPage, cartPage, checkoutStepOnePage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', users.standard_user);
    await inventoryPage.addProduct(selectedProducts[0]);
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutStepOnePage.expectCheckoutStepOneVisible();
    await checkoutStepOnePage.continue();
    await checkoutStepOnePage.expectError('Error: First Name is required');

    await checkoutStepOnePage.fillFirstName(checkoutData.firstName);
    await checkoutStepOnePage.continue();
    await checkoutStepOnePage.expectError('Error: Last Name is required');

    await checkoutStepOnePage.fillLastName(checkoutData.lastName);
    await checkoutStepOnePage.continue();
    await checkoutStepOnePage.expectError('Error: Postal Code is required');
  });
});
