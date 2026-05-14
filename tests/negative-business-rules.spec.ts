import { test } from '../fixtures/testFixtures';
import { users } from '../test-data/users';
import { checkoutData } from '../test-data/checkoutData';
import { attachJson, attachText } from '../utils/allureUtils';

test('empty cart checkout should be marked as a business defect', async ({ loginPage, inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }, testInfo) => {
  test.fail(true, 'Known business defect: empty cart checkout is allowed');

  await loginPage.goto();
  await loginPage.login('standard_user', users.standard_user);
  await inventoryPage.goToCart();

  await cartPage.expectCartPageVisible();
  await attachJson(testInfo, 'empty-cart-state', { url: cartPage.page.url(), cartBadge: await cartPage.cartBadge.count() });

  await cartPage.checkout();
  await checkoutStepOnePage.fillCheckoutInformation(checkoutData.firstName, checkoutData.lastName, checkoutData.postalCode);
  await checkoutStepOnePage.continue();

  await checkoutStepTwoPage.expectCheckoutStepTwoVisible();
  const totalText = await checkoutStepTwoPage.totalLabel.textContent();
  await attachText(testInfo, 'checkout-total', totalText || '');
  await test.step('Verify the system allows empty cart total', async () => {
    await checkoutStepTwoPage.expectTotalPrice('$0.00');
  });

  await checkoutStepTwoPage.finish();
  await checkoutCompletePage.expectOrderComplete();
  throw new Error('Known business defect: empty cart checkout is allowed and should be blocked by business validation');
});
