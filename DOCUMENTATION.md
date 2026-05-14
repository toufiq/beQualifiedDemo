# SauceDemo Playwright Regression Testing Framework

**Project**: Comprehensive regression test automation for https://www.saucedemo.com/  
**Framework**: Playwright + TypeScript  
**Author**: Test Automation Architect  
**Date**: May 14, 2026

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Test Scenarios](#test-scenarios)
- [Running Tests](#running-tests)
- [Page Object Model](#page-object-model)
- [Test Data Management](#test-data-management)
- [Performance Testing](#performance-testing)
- [Defect Handling](#defect-handling)
- [Reporting](#reporting)
- [Best Practices](#best-practices)

---

## Overview

This project implements a **production-grade Playwright automation framework** for the SauceDemo application with:

- ✅ **23 comprehensive test cases** covering standard user workflows and known defects
- ✅ **Page Object Model (POM)** for maintainable, scalable test code
- ✅ **TypeScript** for type safety and better IDE support
- ✅ **Reusable test fixtures** for common setup/teardown operations
- ✅ **Allure reporting** with detailed test evidence and attachments
- ✅ **Performance testing** comparing standard vs. glitched user flows
- ✅ **Defect validation** with explicit marking of known business issues
- ✅ **3 retries** for flaky test resilience
- ✅ **Screenshots/videos/traces** on failure for debugging

### Test Users

The SauceDemo application provides 6 test user accounts:

| User | Password | Behavior |
|------|----------|----------|
| `standard_user` | `secret_sauce` | Normal, functional user |
| `locked_out_user` | `secret_sauce` | Cannot log in (locked account) |
| `problem_user` | `secret_sauce` | Multiple defects: identical images, add-to-cart limit, checkout issues |
| `performance_glitch_user` | `secret_sauce` | Intentional performance degradation (5-6 second delays) |
| `error_user` | `secret_sauce` | Transient errors: add-to-cart, remove, and checkout failures |
| `visual_user` | `secret_sauce` | Visual/data defects: price changes, misalignment |

---

## Architecture

### Framework Stack

```
Playwright @1.42.0          → Browser automation
TypeScript @5.8.0           → Type-safe test code
@playwright/test            → Test runner and assertions
allure-playwright           → Test reporting
allure-commandline          → Report generation
```

### Design Patterns

1. **Page Object Model (POM)**
   - Each page has a dedicated class encapsulating locators and actions
   - Methods represent user interactions (login, addToCart, checkout)
   - Separation of test logic from implementation details

2. **Fixtures**
   - Custom Playwright fixtures for page objects
   - Automatic injection into test functions
   - Centralized page initialization

3. **Test Data Separation**
   - Users, checkout data, and products in dedicated files
   - Easy to update without touching test code
   - Single source of truth for test data

4. **Utility Functions**
   - Price parsing and calculation helpers
   - Performance measurement utilities
   - Visual alignment validation
   - Allure attachment helpers

---

## Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/toufiq/beQualifiedDemo.git
cd beQualifiedDemo/saucedemo-playwright-tests

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Generate Allure report
npm run allure:generate
npm run allure:open
```

---

## Project Structure

```
saucedemo-playwright-tests/
├── tests/
│   ├── standard-user-regression.spec.ts        # 10+ standard user scenarios
│   ├── locked-out-user.spec.ts                 # Login denial validation
│   ├── problem-user-regression.spec.ts         # Problem user defect tests
│   ├── error-user-regression.spec.ts           # Error user defect tests
│   ├── visual-user-regression.spec.ts          # Visual/data defect tests
│   ├── performance-glitch-user.spec.ts         # Performance comparison tests
│   └── negative-business-rules.spec.ts         # Empty cart checkout validation
│
├── pages/
│   ├── LoginPage.ts                            # Login workflow
│   ├── InventoryPage.ts                        # Product inventory & sorting
│   ├── ProductDetailsPage.ts                   # Individual product details
│   ├── CartPage.ts                             # Shopping cart management
│   ├── CheckoutStepOnePage.ts                  # Checkout info collection
│   ├── CheckoutStepTwoPage.ts                  # Order review & calculation
│   └── CheckoutCompletePage.ts                 # Order confirmation
│
├── fixtures/
│   └── testFixtures.ts                         # Playwright fixtures for all page objects
│
├── test-data/
│   ├── users.ts                                # Test user credentials
│   ├── checkoutData.ts                         # Checkout form data
│   └── products.ts                             # SauceDemo product list
│
├── utils/
│   ├── priceUtils.ts                           # Price parsing & sum calculations
│   ├── performanceUtils.ts                     # Performance measurement & comparison
│   ├── visualUtils.ts                          # Visual element alignment checks
│   └── allureUtils.ts                          # Allure report attachment helpers
│
├── playwright.config.ts                        # Playwright configuration
├── tsconfig.json                               # TypeScript configuration
├── package.json                                # Project dependencies & scripts
├── .gitignore                                  # Git ignore rules
├── README.md                                   # Quick start guide
└── DOCUMENTATION.md                            # This file

```

---

## Test Scenarios

### Standard User Regression (10 tests)

✅ **All tests pass** - Validates happy-path functionality:

1. **Login & verify Products page** - Confirm login success and page navigation
2. **All products display correctly** - Image, price, and Add to Cart button visible
3. **Add 3 products & verify cart** - Cart badge updates correctly
4. **Remove product & verify update** - Cart badge and button state reflect removal
5. **Product details navigation** - All products clickable, details correct, back works
6. **Sorting validation** - Name A→Z, Z→A, Price low→high, high→low all functional
7. **Navigate to cart** - Cart icon click works, cart page visible
8. **Cart interactions** - Remove, Continue Shopping, Checkout buttons work
9. **Complete checkout flow** - Full checkout from cart → info → review → confirmation
10. **Required field validation** - First Name, Last Name, Postal Code all required

### Locked Out User (1 test)

✅ **Test passes** - Validates security:
- Login attempt fails with "Epic sadface: Sorry, this user has been locked out."

### Problem User Defects (3 tests)

❌ **Tests marked as expected failures** - Validates known defects:

1. **Identical product images** - All 6 products show the same dog image (defect)
2. **Add-to-cart limit** - Cannot add all 6 products (only ~3 succeed)
3. **Checkout last name field** - Last Name field doesn't accept input or validates incorrectly

### Error User Defects (3 tests)

❌ **Tests marked as expected failures** - Validates error state:

1. **Add-to-cart limit** - Only ~3 products can be added
2. **Last Name field broken** - Doesn't accept input on checkout
3. **Finish button non-functional** - Order completion fails

### Visual User Defects (4 tests)

❌ **Tests marked as expected failures** - Validates visual/data issues:

1. **Prices change after refresh** - Inventory prices unstable
2. **Price mismatch inventory → cart** - Different price displayed on cart
3. **Cart icon misalignment** - Not right-aligned with sort dropdown
4. **Checkout button placement** - Verify correct footer placement (passes - not actually a defect)

### Performance Glitch User (1 test)

✅ **Test passes** - Validates performance degradation:
- Measures and compares login, product detail, sorting, and navigation times
- Attaches detailed performance comparison table to report
- Example: login takes 5+ seconds vs. standard ~400ms

### Negative Business Rules (1 test)

❌ **Test marked as intentional failure** - Validates business defect:
- Empty cart checkout is technically allowed by the app but shouldn't be
- Test completes successfully, then throws error to fail in report
- Demonstrates business rule violation with evidence

---

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
npm run test:standard       # Standard user regression only
npm run test:problem        # Problem user defects
npm run test:error          # Error user defects
npm run test:visual         # Visual user defects
npm run test:performance    # Performance comparison
```

### Headed Mode (see browser)
```bash
npm run test:headed
```

### Debug Mode (interactive debugging)
```bash
npm run test:debug
```

### With Allure Report
```bash
npm test
npm run allure:generate
npm run allure:open
```

---

## Page Object Model

Each page is implemented as a TypeScript class with:
- Private/readonly properties for locators
- Public async methods for user actions
- Strong typing for parameters and returns
- Reusable assertion methods

### Example: LoginPage

```typescript
export class LoginPage {
  readonly page: Page;
  readonly usernameInput;
  readonly passwordInput;
  readonly loginButton;
  readonly errorMessage;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
```

### All Page Objects

| Page | Responsibilities |
|------|------------------|
| **LoginPage** | Authentication, error handling |
| **InventoryPage** | Product listing, filtering, sorting, cart interaction |
| **ProductDetailsPage** | Product details, add/remove from cart, navigation |
| **CartPage** | Cart items, removal, checkout navigation |
| **CheckoutStepOnePage** | Customer info collection, validation |
| **CheckoutStepTwoPage** | Order review, price calculation, finalization |
| **CheckoutCompletePage** | Order confirmation, thank you message |

---

## Test Data Management

### Users (test-data/users.ts)
```typescript
export const users = {
  standard_user: 'secret_sauce',
  locked_out_user: 'secret_sauce',
  problem_user: 'secret_sauce',
  performance_glitch_user: 'secret_sauce',
  error_user: 'secret_sauce',
  visual_user: 'secret_sauce'
};
```

### Checkout Data (test-data/checkoutData.ts)
```typescript
export const checkoutData = {
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '12345'
};
```

### Products (test-data/products.ts)
```typescript
export const products = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)'
];
```

---

## Performance Testing

### Methodology

Performance tests measure real-world user action durations:

```typescript
await measureAction('login', async () => loginPage.login(username, password), durations);
await measureAction('open-product-details', async () => inventoryPage.openProductDetails(products[0]), durations);
```

### Performance Comparison Output

```
Action | standard_user | performance_glitch_user | difference
login | 442ms | 5846ms | +5404ms
open-product-details | 146ms | 101ms | -45ms
back-to-products | 129ms | 5161ms | +5032ms
sort-name-az | 83ms | 5098ms | +5015ms
```

### Attachments

Performance comparison tables are attached to Allure reports for analysis and trending.

---

## Defect Handling

### Strategy

The framework explicitly validates and documents known defects:

1. **Defect Detection**: Tests perform the action that should fail
2. **Evidence Collection**: Screenshots, network logs, and data attached
3. **Explicit Failure**: Use `test.fail()` or `throw Error()` to mark intentional failures
4. **Reporting**: Allure report shows defects as "Expected Failures"

### Example: Problem User - Identical Images

```typescript
test('should expose identical product images', async ({ loginPage, inventoryPage }, testInfo) => {
  test.fail(true, 'Known visual defect: problem_user product images are identical');
  // ... test code ...
  const imageUrls = await inventoryPage.getProductImages();
  await testInfo.attach('image-sources', { body: JSON.stringify(imageUrls, null, 2), contentType: 'application/json' });
  await expect(new Set(imageUrls).size).toBeGreaterThan(1); // Fails here
});
```

### Defects Validated

| User | Defect | Status | Impact |
|------|--------|--------|--------|
| problem_user | Identical product images | ❌ Expected Failure | Visual/UX |
| problem_user | Cannot add all products | ❌ Expected Failure | Business Logic |
| problem_user | Last Name field broken | ❌ Expected Failure | Business Logic |
| error_user | Add-to-cart limit | ❌ Expected Failure | Business Logic |
| error_user | Last Name field broken | ❌ Expected Failure | Business Logic |
| visual_user | Prices change after refresh | ❌ Expected Failure | Data Consistency |
| visual_user | Price mismatch inventory ↔ cart | ❌ Expected Failure | Data Consistency |
| empty cart | Checkout allowed with $0.00 | ❌ Expected Failure | Business Rule |

---

## Reporting

### Playwright HTML Report

```bash
npx playwright show-report
```

Includes:
- Test execution timeline
- Pass/fail summary
- Screenshots on failure
- Video recordings
- Trace files for debugging

### Allure Report

```bash
npm run allure:generate
npm run allure:open
```

Features:
- Test statistics and trends
- Detailed test steps with attachments
- Failure analysis with screenshots
- Performance metrics
- Timeline view
- Custom defect labels and severity

### Test Execution Results

**Latest Run**: May 14, 2026

```
Running 23 tests using 2 workers
  ✅ 23 passed
  ✅ Performance comparison attached
  ✅ Allure report generated
```

---

## Best Practices

### 1. Page Object Model
- ✅ Locators encapsulated in page classes
- ✅ Methods represent user actions
- ✅ No test logic in page objects
- ✅ Reusable across tests

### 2. Test Independence
- ✅ Each test sets up its own state
- ✅ No test-to-test dependencies
- ✅ Can run in any order
- ✅ Can run individually

### 3. Waits & Timeouts
- ✅ Implicit waits via Playwright locators
- ✅ Explicit waits for dynamic content
- ✅ 60 second test timeout
- ✅ 10 second expectation timeout

### 4. Assertions
- ✅ Use Playwright `expect()` for all assertions
- ✅ Clear error messages with `toContainText()`, `toHaveText()`, etc.
- ✅ Avoid generic `toBeTruthy()` checks
- ✅ Document expected vs. actual behavior

### 5. Test Data
- ✅ Centralized test data files
- ✅ No hardcoded values in tests
- ✅ Easy to update globally
- ✅ Type-safe with TypeScript

### 6. Error Handling
- ✅ Use `test.fail()` for known defects
- ✅ Attach evidence with `testInfo.attach()`
- ✅ Document failure reason clearly
- ✅ Include expected vs. actual in error message

### 7. Performance Considerations
- ✅ Use `fullyParallel: false` for stability
- ✅ Only 2 workers to avoid resource contention
- ✅ Screenshots/videos only on failure
- ✅ Traces retained for debugging

---

## Maintenance & Scaling

### Adding New Tests

1. Create test file in `tests/` directory
2. Import page objects from `pages/`
3. Use fixtures for page object injection
4. Follow naming convention: `{scenario}.spec.ts`
5. Add to appropriate npm script in `package.json`

### Updating Locators

1. Find selector in relevant page object file
2. Use browser inspector or Playwright Test Generator
3. Update locator definition
4. Re-run affected tests to validate

### Adding Test Data

1. Add to appropriate file in `test-data/`
2. Export as constant
3. Import in test file
4. Use in test function

---

## Troubleshooting

### Tests Timeout
- Increase `timeout` in `playwright.config.ts`
- Check for missing waits on dynamic content
- Verify network connectivity to saucedemo.com

### Flaky Tests
- Check for race conditions with waits
- Use `waitForLoadState()` for network events
- Consider environment-specific timing

### Screenshot/Video Issues
- Verify `playwright.config.ts` settings
- Check disk space for artifacts
- Review `test-results/` directory

### Allure Report Generation Fails
- Ensure `allure-commandline` is installed
- Check `allure-results/` directory exists
- Verify Java is available for Allure

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Contact & Support

For issues, questions, or contributions:
- GitHub: https://github.com/toufiq/beQualifiedDemo
- Framework: Playwright (https://playwright.dev/)
- Reporting: Allure (https://docs.qameta.io/allure/)

---

**Last Updated**: May 14, 2026  
**Framework Version**: 1.0.0  
**Playwright Version**: 1.42.0
