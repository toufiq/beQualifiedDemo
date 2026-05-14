import { test } from '../fixtures/testFixtures';
import { users } from '../test-data/users';

test('locked out user cannot login', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login('locked_out_user', users.locked_out_user);
  await loginPage.expectLoginError('Epic sadface: Sorry, this user has been locked out.');
});
