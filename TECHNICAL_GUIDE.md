# Technical Implementation Guide

## Configuration Details

### playwright.config.ts

```typescript
const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60000,                    // 60 second timeout per test
  expect: { timeout: 10000 },        // 10 second timeout for assertions
  retries: 3,                        // Retry failed tests 3 times
  fullyParallel: false,              // Sequential execution for stability
  reporter: [
    ['line'],                        // Console output
    ['html', { open: 'never' }],     // HTML report
    ['allure-playwright']            // Allure report
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',   // Screenshots on failure
    video: 'retain-on-failure',      // Video on failure
    trace: 'retain-on-failure'       // Trace on failure
  }
};
```

### Key Configuration Decisions

1. **Retries: 3** - Balances stability with execution time
2. **fullyParallel: false** - Sequential mode prevents resource conflicts and data races
3. **Screenshots/Videos/Traces on failure** - Provides debugging evidence without bloating storage
4. **60 second timeout** - Accounts for performance_glitch_user delays

---

## Fixture Implementation

### testFixtures.ts Pattern

```typescript
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
// ... import all page objects

type AppFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  // ... all pages
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  // ... all page objects
});

export { expect };
```

### Fixture Benefits

- Automatic injection into test functions
- Fresh instance per test
- Type-safe: IDE autocomplete for all page objects
- Cleaner test code vs. manual initialization

---

## Page Object Implementation

### Locator Strategy

```typescript
export class InventoryPage {
  readonly page: Page;
  readonly title = page.locator('.title');
  readonly inventoryItems = page.locator('.inventory_item');
  readonly sortSelect = page.locator('.product_sort_container');
  readonly cartBadge = page.locator('.shopping_cart_badge');
  readonly cartIcon = page.locator('.shopping_cart_link');
}
```

### Locator Priorities

1. **data-test attributes** - Most reliable, explicitly set by developers
2. **CSS selectors** - Class-based, semantic HTML elements
3. **Text content** - Last resort, fragile to copy changes
4. **XPath** - Avoided, hard to maintain

### Common Patterns

#### Adding Products by Name
```typescript
async addProduct(productName: string) {
  const card = this.inventoryItems.filter({ 
    has: this.page.locator('.inventory_item_name', { hasText: productName }) 
  });
  await card.locator('button').click();
}
```

#### Sorting with Mapping
```typescript
const sortValueMapping: Record<string, string> = {
  'Name A to Z': 'az',
  'Name Z to A': 'za',
  'Price low to high': 'lohi',
  'Price high to low': 'hilo'
};

async sortBy(option: string) {
  await this.sortSelect.selectOption(sortValueMapping[option] ?? option);
}
```

#### Price Validation
```typescript
async expectItemTotalMatchesProductSum() {
  const prices = await this.productPrices.allTextContents();
  const totalSum = sumPrices(prices);
  const labelText = await this.itemTotalLabel.textContent();
  const reported = parsePrice(labelText || '0');
  await expect(reported).toBeCloseTo(totalSum, 2);
}
```

---

## Test Data Organization

### Why Separation Matters

```
❌ AVOID: Hardcoded in tests
test('login', () => {
  await login('standard_user', 'secret_sauce');
});

✅ BETTER: External data
import { users } from '../test-data/users';
test('login', () => {
  await login('standard_user', users.standard_user);
});
```

### Benefits
- Single source of truth
- Easy global updates (e.g., password change)
- Reusable across multiple tests
- Type-safe imports in TypeScript

---

## Utility Functions

### Price Utilities

```typescript
export const parsePrice = (priceText: string): number => {
  const value = priceText.replace(/[^0-9.]/g, '');
  return parseFloat(value) || 0;
};

export const sumPrices = (prices: string[]): number => {
  return prices.map(parsePrice).reduce((sum, price) => sum + price, 0);
};
```

### Performance Utilities

```typescript
export const measureAction = async <T>(
  label: string, 
  action: () => Promise<T>, 
  durations: PerformanceDurations
): Promise<T> => {
  const start = Date.now();
  const result = await action();
  durations[label] = Date.now() - start;
  return result;
};
```

### Visual Utilities

```typescript
export const isRightAligned = (
  reference: BoundingBox | null, 
  target: BoundingBox | null, 
  tolerance = 10
): boolean => {
  if (!reference || !target) return false;
  const referenceRight = reference.x + reference.width;
  const targetRight = target.x + target.width;
  return Math.abs(referenceRight - targetRight) <= tolerance;
};
```

---

## Test Structure Pattern

### Standard Test Layout

```typescript
import { test, expect } from '../fixtures/testFixtures';
import { users } from '../test-data/users';
import { products } from '../test-data/products';
import { attachJson } from '../utils/allureUtils';

test('descriptive test name', async ({ 
  loginPage, 
  inventoryPage, 
  testInfo 
}) => {
  // Arrange: Set up test state
  await loginPage.goto();
  
  // Act: Perform user action
  await loginPage.login('standard_user', users.standard_user);
  
  // Assert: Verify expected outcome
  await inventoryPage.expectProductsPageVisible();
  
  // Attach: Add evidence for reporting
  await attachJson(testInfo, 'login-metadata', { 
    user: 'standard_user', 
    url: loginPage.page.url() 
  });
});
```

### Test Steps with Allure

```typescript
test('complete checkout flow', async ({ ... }, testInfo) => {
  await test.step('Navigate to login page', async () => {
    await loginPage.goto();
  });

  await test.step('Authenticate', async () => {
    await loginPage.login('standard_user', users.standard_user);
  });

  await test.step('Add product to cart', async () => {
    await inventoryPage.addProduct(products[0]);
  });

  // ... more steps
});
```

### Expected Failure Handling

```typescript
// Option 1: test.fail() for known defects
test('should expose product image defect', async () => {
  test.fail(true, 'Known defect: problem_user images are identical');
  // ... test code that will fail
});

// Option 2: Explicit error for business rule violations
test('empty cart checkout', async () => {
  // ... complete checkout with empty cart successfully
  throw new Error('Business defect: empty cart should not be checkoutable');
});
```

---

## Common Testing Scenarios

### Login Validation

```typescript
test('login and verify dashboard', async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login('standard_user', users.standard_user);
  await inventoryPage.expectProductsPageVisible();
});
```

### Product Interaction

```typescript
test('add and remove products', async ({ inventoryPage }) => {
  await inventoryPage.addProduct(products[0]);
  await inventoryPage.expectCartBadgeCount(1);
  
  await inventoryPage.removeProduct(products[0]);
  await inventoryPage.expectCartBadgeHidden();
});
```

### Navigation Flow

```typescript
test('cart to checkout flow', async ({ cartPage, checkoutStepOnePage }) => {
  await cartPage.checkout();
  await checkoutStepOnePage.expectCheckoutStepOneVisible();
});
```

### Data Validation

```typescript
test('verify price calculations', async ({ checkoutStepTwoPage }) => {
  await checkoutStepTwoPage.expectIndividualPricesVisible();
  await checkoutStepTwoPage.expectItemTotalMatchesProductSum();
  await checkoutStepTwoPage.expectTaxVisible();
});
```

---

## Debugging Strategies

### View Generated Test
```bash
npx playwright show-report
# Click on test → see all steps, screenshots, videos
```

### Debug Mode (Step Through)
```bash
npm run test:debug
# Inspector opens, step through code
```

### Headed Mode (Watch Execution)
```bash
npm run test:headed
# Browser window visible, slower execution
```

### Trace Viewer
```bash
npx playwright show-trace test-results/.../trace.zip
# Timeline view of all actions, DOM snapshots, network logs
```

### Print Debugging
```typescript
console.log('Current URL:', page.url());
console.log('Product count:', await inventoryPage.inventoryItems.count());
```

---

## Performance Considerations

### Test Execution Time

**Current Performance** (23 tests):
- ~1.4-2 minutes total
- ~3-6 seconds per standard test
- Performance tests add ~10% overhead due to measurement

### Optimization Techniques

1. **Reduce retries** (currently 3)
   - Production: Keep at 3
   - CI: Consider 2 for speed
   - Local: Set to 1 for faster feedback

2. **Parallel workers** (currently 1, sequential)
   - Increased workers require state isolation
   - Data conflicts on shared test accounts
   - Recommendation: Keep sequential for SauceDemo

3. **Skip non-critical artifacts**
   - Videos only on failure: `retain-on-failure`
   - Screenshots only on failure: `only-on-failure`
   - Traces only on failure: `retain-on-failure`

---

## Maintenance Guidelines

### Adding New Test
1. Create file: `tests/new-scenario.spec.ts`
2. Import fixtures and fixtures and dependencies
3. Write test using Page Objects
4. Add to npm script if needed
5. Run: `npm run test:new-scenario` (if created script)

### Updating Page Object
1. Find the locator that needs updating
2. Use Playwright Inspector to find new selector
3. Update page object file
4. Re-run tests to verify changes
5. Commit with clear message

### Handling Locator Changes
```typescript
// Before: Locator breaks
readonly sortSelect = page.locator('.old-class');

// After: Updated locator
readonly sortSelect = page.locator('[data-test="sort-dropdown"]');

// Test & commit
```

### Adding New Product
```typescript
// test-data/products.ts
export const products = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  // ... existing
  'New Product Name'  // Add here
];

// All tests using `products` automatically include it
```

---

## Error Messages & Resolution

### "Locator for .inventory_item resolved to 2 elements"
**Cause**: Selector too generic, matches multiple elements  
**Fix**: Use more specific locator with filter or data attribute
```typescript
const card = this.inventoryItems.filter({ 
  has: this.page.locator('.inventory_item_name', { hasText: productName }) 
});
```

### "expect(locator).toContainText(expected) failed"
**Cause**: Expected text not found  
**Fix**: Check actual text, use `textContent()` to debug
```typescript
const actual = await locator.textContent();
console.log('Expected:', expected);
console.log('Actual:', actual);
```

### "Timeout waiting for locator"
**Cause**: Element not visible in 10 seconds (expect) or 60 seconds (test)  
**Fix**: Add explicit wait or check for navigation
```typescript
await page.waitForLoadState('networkidle');
await locator.waitFor({ state: 'visible' });
```

### "test.fail() test passed - mark as expected failure"
**Cause**: Test was supposed to fail (defect test) but passed  
**Fix**: Verify defect still exists in app, or remove test.fail()
```typescript
// If defect fixed:
await expect(imageUrls.length).toBeGreaterThan(1); // Should pass now
```

---

## Continuous Integration

### GitHub Actions Setup
```yaml
- name: Run Playwright tests
  run: npm test

- name: Generate Allure report
  if: always()
  run: npm run allure:generate

- name: Upload reports
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
```

### Recommended CI Settings
- **Trigger**: On every push and pull request
- **Node version**: 18.x LTS
- **Timeout**: 10-15 minutes
- **Artifact retention**: 30 days
- **Notification**: Slack/Teams on failure

---

**Document Version**: 1.0  
**Last Updated**: May 14, 2026
