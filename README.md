# SauceDemo Playwright Regression Tests

This project contains Playwright regression tests for https://www.saucedemo.com/ using TypeScript, Page Object Model, reusable fixtures, and Allure reporting.

## Setup

```bash
cd saucedemo-playwright-tests
npm install
npx playwright install
```

## Run tests

```bash
npm test
npm run test:standard
npm run test:problem
npm run test:error
npm run test:visual
npm run test:performance
```

## Reporting

```bash
npm run allure:generate
npm run allure:open
```
