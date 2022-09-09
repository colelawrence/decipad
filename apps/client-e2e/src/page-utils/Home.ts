export async function setUp() {
  await page.goto('/api/auth/signout');
  await page.goto('/');
}
