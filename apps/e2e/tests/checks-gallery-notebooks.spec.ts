import fs from 'fs';
import path from 'path';
import { expect, test } from './manager/decipad-tests';

const matcher = process.env.SELECT_NOTEBOOK || '';

const filesPath = path.join(__dirname, '..', '__fixtures__', 'gallery');
const files = fs.readdirSync(filesPath);
const jsonFiles = files
  .filter((file) => file.endsWith('.json'))
  .filter((file) => file.includes(matcher));

for (const file of jsonFiles) {
  test(`Check gallery template: ${file}`, async ({ randomFreeUser }) => {
    const { page } = randomFreeUser;
    await randomFreeUser.goToWorkspace();

    await test.step(`Load template`, async () => {
      const filePath = path.join(filesPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const source = JSON.parse(fileContent);

      await randomFreeUser.importNotebook(source);
      await expect(randomFreeUser.notebook.notebookTitle).toContainText(
        '[Template]'
      );
    });

    await test.step(`Check errors`, async () => {
      await expect(async () => {
        // check for errors in calculations
        await expect(
          page.getByTestId('code-line-warning'),
          `calculation errors visible`
        ).toBeHidden();

        // check for error blocks
        await expect(
          page.getByTestId('error-block'),
          `broken blocks visible`
        ).toBeHidden();

        // check for results that didn't load or magic errors, the code base uses loading-results & loading-animation
        await expect(
          page.getByTestId('loading-results'),
          `loading blocks visible`
        ).toBeHidden();

        // check if integrations get stuck loading, the code base uses loading-results & loading-animation
        await expect(
          page.getByTestId('loading-animation'),
          `loading blocks visible`
        ).toBeHidden();
      }).toPass({
        intervals: [4_000],
        timeout: 20_000,
      });
    });
  });
}
