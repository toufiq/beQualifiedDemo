import { test } from '../fixtures/testFixtures';
import { users } from '../test-data/users';
import { products } from '../test-data/products';
import { compareDurations, measureAction } from '../utils/performanceUtils';
import { attachText } from '../utils/allureUtils';

const standardDurations = {};
const glitchDurations = {};

const runPerformanceFlow = async ({ loginPage, inventoryPage, productDetailsPage, cartPage }: any, username: string, password: string, durations: Record<string, number>) => {
  await loginPage.goto();
  await measureAction('login', async () => loginPage.login(username, password), durations);
  await measureAction('open-product-details', async () => inventoryPage.openProductDetails(products[0]), durations);
  await measureAction('back-to-products', async () => productDetailsPage.backToProducts(), durations);
  await measureAction('sort-name-az', async () => inventoryPage.sortBy('Name A to Z'), durations);
  await measureAction('sort-name-za', async () => inventoryPage.sortBy('Name Z to A'), durations);
  await measureAction('sort-price-lohi', async () => inventoryPage.sortBy('Price low to high'), durations);
  await measureAction('sort-price-hilo', async () => inventoryPage.sortBy('Price high to low'), durations);
  await inventoryPage.addProduct(products[0]);
  await inventoryPage.goToCart();
  await measureAction('continue-shopping', async () => cartPage.continueShopping(), durations);
};

test('performance glitch user should show slower application actions', async ({ loginPage, inventoryPage, productDetailsPage, cartPage }, testInfo) => {
  await test.step('Collect baseline for standard_user', async () => {
    await runPerformanceFlow({ loginPage, inventoryPage, productDetailsPage, cartPage }, 'standard_user', users.standard_user, standardDurations);
  });

  await test.step('Collect durations for performance_glitch_user', async () => {
    await runPerformanceFlow({ loginPage, inventoryPage, productDetailsPage, cartPage }, 'performance_glitch_user', users.performance_glitch_user, glitchDurations);
  });

  const comparison = compareDurations(standardDurations, glitchDurations);
  await attachText(testInfo, 'performance-comparison', comparison);
  console.log('Performance comparison:\n', comparison);
});
