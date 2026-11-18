import { test, expect } from '../utils/fixtures';

test('should open Garage page for authenticated user', async ({
  userGaragePage,
}) => {
  await expect(userGaragePage.myProfileButton).toBeVisible();
});
