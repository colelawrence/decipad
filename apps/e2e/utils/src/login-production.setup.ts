import { Page, expect, test } from '../../tests/manager/decipad-tests';
import { STORAGE_STATE_PRODUCTION } from '../../playwright.config';
import axios from 'axios';
import { Workspace } from '../../tests/manager/workspace';

export async function deleteAllWorkspaceNotebooks(
  page: Page,
  workspace: Workspace
) {
  await expect(async () => {
    // archives notebooks until the workspace is empty
    if ((await page.getByText('No documents to list').count()) !== 1) {
      await workspace.archivePad(0);
    }
    await expect(page.getByText('No documents to list')).toBeVisible({
      timeout: 100,
    });
  }).toPass();
  await workspace.openArchive();

  // deleted notebooks from archive until the archive is empty
  await expect(async () => {
    if ((await page.getByText('No documents to list').count()) !== 1) {
      await workspace.deleteNotepad(0);
    }
    await expect(page.getByText('No documents to list')).toBeVisible({
      timeout: 100,
    });
  }).toPass();
}

test('save storage state for reuse', async ({ page }) => {
  // Randomly generating the tag...
  const TAG = 'regression-testing'; // Date.now().toString(36).substr(2, 12);

  const email = `q71nx.${TAG}@inbox.testmail.app`;

  await page.goto('https://app.decipad.com');
  await page.getByPlaceholder('Enter your email').fill(email);
  await page.getByTestId('login-button').click();

  await expect(
    page.getByText(
      `Open the link sent to ${email}. No email? Check spam folder.`
    )
  ).toBeVisible();

  const ENDPOINT = `https://api.testmail.app/api/json?apikey=${process.env.TESTMAIL_APIKEY}&namespace=${process.env.TESTMAIL_NAMESPACE}`;
  const startTimestamp = Date.now();

  const response = await axios.get(
    `${ENDPOINT}&tag=${TAG}&timestamp_from=${startTimestamp}&livequery=true`
  );
  const inbox = response.data;

  expect(
    inbox.emails.length,
    "the email wasn't sent to the test email or retrieved"
  ).toBeGreaterThan(0);

  const htmlString = inbox.emails[0].html;

  expect(htmlString.trim(), 'The email was empty').not.toBe('');

  const regex = /<a\s+class="h2b-button"\s+[^>]*\s+href="([^"]+)"/;
  const match = htmlString.match(regex);

  expect(match && match.length > 1, 'Button with link not found').toBeTruthy();

  const link = match[1];
  page.goto(link);
  const workspace = new Workspace(page);
  // if there are notebooks there from previous fails remove eveything
  deleteAllWorkspaceNotebooks(page, workspace);
  await expect(page.getByText('No documents to list')).toBeVisible();
  await page.context().storageState({ path: STORAGE_STATE_PRODUCTION });
});
