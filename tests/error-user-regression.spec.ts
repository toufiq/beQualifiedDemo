import { test, expect } from '../fixtures/testFixtures';
import { users } from '../test-data/users';
import { products } from '../test-data/products';

const addAllProducts = async (inventoryPage: any) => {
  for (const product of products) {
    await inventoryPage.addProduct(product);
  }
};

test.describe('Error user defects', () => {
  test('should expose add-to-cart limit for error_user', async ({ loginPage, inventoryPage }, testInfo) => {
    test.fail(true, 'Known business defect: error_user cannot add all products to cart');
    await loginPage.goto();
    await loginPage.login('error_user', users.error_user);
    await addAllProducts(inventoryPage);
    await testInfo.attach('cart-badge', { body: await inventoryPage.cartBadge.textContent() ?? '', contentType: 'text/plain' });
    await inventoryPage.expectCartBadgeCount(6);
  });

  test('should verify remove works for error_user', async ({ loginPage, inventoryPage, cartPage }, testInfo) => {
    await loginPage.goto();
    await loginPage.login('error_user', users.error_user);
    await inventoryPage.addProduct(products[0]);
    await inventoryPage.addProduct(products[1]);
    await inventoryPage.goToCart();
    await cartPage.removeProduct(products[0]);
    await testInfo.attach('cart-badge-after-remove', { body: await cartPage.cartBadge.textContent() ?? '', contentType: 'text/plain' });
    await cartPage.expectCartBadgeCount(1);
  });

  test('should expose checkout last name field for error_user', async ({ loginPage, inventoryPage, cartPage, checkoutStepOnePage }, testInfo) => {
    test.fail(true, 'Known business defect: error_user checkout last name field does not accept value');
    await loginPage.goto();
    await loginPage.login('error_user', users.error_user);
    await inventoryPage.addProduct(products[0]);
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutStepOnePage.fillFirstName('Error');
    await checkoutStepOnePage.fillLastName('User');
    await checkoutStepOnePage.fillPostalCode('12345');
    await testInfo.attach('last-name-value', { body: await checkoutStepOnePage.lastNameInput.inputValue(), contentType: 'text/plain' });
    await expect(await checkoutStepOnePage.lastNameInput.inputValue()).toBe('User');
  });

  test('should expose finish button defect for error_user', async ({ loginPage, inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    test.fail(true, 'Known business defect: error_user finish button does not complete the order');
    await loginPage.goto();
    await loginPage.login('error_user', users.error_user);
    await inventoryPage.addProduct(products[0]);
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutStepOnePage.fillCheckoutInformation('Error', 'User', '12345');
    await checkoutStepOnePage.continue();
    await checkoutStepTwoPage.finish();
    await checkoutCompletePage.expectOrderComplete();
  });
});
