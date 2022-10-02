export const signOut = async () => {
  await page.goto('/api/auth/signout');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForEvent('load'),
  ]);
};

export async function setUp() {
  await signOut();
  await Promise.all([page.goto('/'), page.waitForEvent('load')]);
}
