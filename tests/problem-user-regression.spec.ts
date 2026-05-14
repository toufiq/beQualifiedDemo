import { test, expect } from '../fixtures/testFixtures';
import { users } from '../test-data/users';
import { products } from '../test-data/products';

const imagesUnique = (images: string[]) => new Set(images).size > 1;

test.describe('Problem user defects', () => {
  test('should expose identical product images', async ({ loginPage, inventoryPage }, testInfo) => {
    test.fail(true, 'Known visual defect: problem_user product images are identical');
    await loginPage.goto();
    await loginPage.login('problem_user', users.problem_user);
    const imageUrls = await inventoryPage.getProductImages();
    await testInfo.attach('image-sources', { body: JSON.stringify(imageUrls, null, 2), contentType: 'application/json' });
    await inventoryPage.expectProductsPageVisible();
    await expect(imageUrls.length).toBeGreaterThan(0);
    await expect(new Set(imageUrls).size).toBeGreaterThan(1);
  });

  test('should expose add-to-cart limit defect', async ({ loginPage, inventoryPage }, testInfo) => {
    test.fail(true, 'Known business defect: problem_user cannot add all products to cart');
    await loginPage.goto();
    await loginPage.login('problem_user', users.problem_user);
    for (const product of products) {
      await inventoryPage.addProduct(product);
    }
    await testInfo.attach('cart-badge-after-add', { body: await inventoryPage.cartBadge.textContent() ?? '', contentType: 'text/plain' });
    await inventoryPage.expectCartBadgeCount(6);
  });

  test('should expose checkout last name field defect', async ({ loginPage, inventoryPage, cartPage, checkoutStepOnePage }, testInfo) => {
    test.fail(true, 'Known business defect: problem_user last name field is broken');
    await loginPage.goto();
    await loginPage.login('problem_user', users.problem_user);
    await inventoryPage.addProduct(products[0]);
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutStepOnePage.fillFirstName('Test');
    await checkoutStepOnePage.fillLastName('User');
    await checkoutStepOnePage.fillPostalCode('12345');
    await testInfo.attach('last-name-value', { body: await checkoutStepOnePage.lastNameInput.inputValue(), contentType: 'text/plain' });
    await expect(await checkoutStepOnePage.lastNameInput.inputValue()).toBe('User');
    await checkoutStepOnePage.continue();
    await checkoutStepOnePage.expectError('Error: Last Name is required');
  });
});
