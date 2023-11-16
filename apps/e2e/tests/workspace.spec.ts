import { expect, test, Page, BrowserContext } from './manager/decipad-tests';
import { setUp } from '../utils/page/Editor';
import {
  clickNewPadButton,
  duplicatePad,
  getPadList,
  removePad,
  ellipsisSelector,
} from '../utils/page/Workspace';
import { snapshot } from '../utils/src';

test('Section creation', async ({ randomFreeUser }) => {
  const { page } = randomFreeUser;

  await test.step('Creating a new section', async () => {
    await page.getByTestId('new-section-button').click();
    await page.getByPlaceholder('My section').fill('Section Creation Test 1');
    await page.getByTestId('color-section-button').nth(2).click();
    await page.getByRole('button', { name: 'Create Section' }).click();
    await expect(page.getByText('Section Creation Test 1')).toBeVisible();
  });

  await test.step('Cancelling a new section', async () => {
    await page.getByTestId('new-section-button').click();
    await page.getByPlaceholder('My section').fill('Section Creation Test 2');
    await page.getByTestId('closable-modal').click();
    await expect(page.getByText('Section Creation Test 2')).toBeHidden();
  });
});

test('workspace sections', async ({ randomFreeUser }) => {
  const { page } = randomFreeUser;

  await test.step('new workspacsection', async () => {
    await page.getByTestId('new-section-button').click();
    await page.getByPlaceholder('My section').fill('Drag and Drop Test');
    await page.getByRole('button', { name: 'Create Section' }).click();

    // Navigating back to My Notebooks
    await expect(async () => {
      await page.getByTestId('my-notebooks-button').click();
      await expect(page.getByText('No documents to list')).toBeHidden();
    }).toPass();
  });

  await test.step('Searching on the search bar and dragging the notebook', async () => {
    await expect(async () => {
      await expect(page.getByTestId('workspace-hero-title')).toBeVisible();
    }).toPass();
    await page.getByTestId('search-bar').click();
    await page
      .getByTestId('search-bar')
      .pressSequentially('Welcome to Decipad!');

    // Dragging the notebook
    await page
      .getByTestId('notebook-list-item')
      .getByText('Welcome to Decipad!')
      .hover();
    await page.mouse.down();
    await page.getByText('Drag and Drop Test').hover();
    await page.mouse.up();
  });

  await test.step('Checking if the right notebook was dragged into the section', async () => {
    await page
      .getByTestId('navigation-list-item')
      .getByText('Drag and Drop Test')
      .click();
    await expect(
      page.getByTestId('notebook-list-item').getByText('Welcome to Decipad!')
    ).toBeVisible();

    // check section labels are visible with filter
    await randomFreeUser.workspace.checkLabel('Drag and Drop Test');

    // check section label are persistant on reload
    await page.reload();
    await randomFreeUser.workspace.checkLabel('Drag and Drop Test');

    // check standard view showcases notebook labels
    await expect(async () => {
      await page.getByTestId('my-notebooks-button').click();
      await randomFreeUser.workspace.checkLabel('Drag and Drop Test');
    }).toPass();
  });

  await test.step('Checking if the no search result warning banner is displayed', async () => {
    await expect(page.getByTestId('no-correct-search-result')).toBeHidden();
  });
});

const byName = (a: { name: string }, b: { name: string }): number => {
  return a.name.localeCompare(b.name);
};

test.describe('Dashboard snapshot', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let localStorageValue: string | null;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();
    await setUp(
      { page, context },
      { createAndNavigateToNewPad: false, randomUser: true }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should display the initial notebooks', async () => {
    const pads = await (await getPadList(page)).sort(byName);

    // eslint-disable-next-line no-unused-expressions, playwright/no-conditional-in-test
    process.env.CI || process.env.DECI_E2E
      ? expect(pads).toMatchObject(
          [
            'Welcome to Decipad!',
            'Starting a Business - Example Notebook',
            'Weekend Trip - Example Notebook',
          ]
            .map((notebook) => ({ name: notebook }))
            .sort(byName)
        )
      : expect(pads).toMatchObject(
          [
            '[Template] Capitalisation table for seed founders',
            '[Template] Decipad Investor Update: Mar 2023',
            '[Template] How much is Apple worth? Breaking down a DCF model.',
            '[Template] Offer Letter',
            '[Template] Performance summary letter',
            '[Template] Sales Report: Monthly Pipeline Update',
            '[Template] Shilling Founders Fund | An innovative approach to profit sharing',
            '[Template] Sprint Capacity Calculation for Scrum Teams',
            '[Template] Understanding stock options at an early stage startup',
            'Everything, everywhere, all at once',
            'Very weird loading when editing',
            'Welcome to Decipad!',
            'Starting a Business - Example Notebook',
            'Weekend Trip - Example Notebook',
          ]
            .map((notebook) => ({ name: notebook }))
            .sort(byName)
        );

    await snapshot(page as Page, 'Dashboard: Initial Notebooks');
  });

  test.use({ colorScheme: 'dark' });

  test('shows workspace in dark mode mode', async () => {
    await expect(async () => {
      localStorageValue = await page.evaluate(() => {
        window.localStorage.setItem('deciThemePreference', 'dark');
        return window.localStorage.getItem('deciThemePreference');
      });

      if (localStorageValue !== null) {
        expect(localStorageValue).toMatch('dark');
      }
    }).toPass();
    await page.reload({ waitUntil: 'load' });
    await snapshot(page as Page, 'Dashboard: Initial Notebooks Darkmode');
  });

  test.use({ colorScheme: 'light' });

  test('shows workspace in light mode mode', async () => {
    await expect(async () => {
      localStorageValue = await page.evaluate(() => {
        window.localStorage.setItem('deciThemePreference', 'light');
        return localStorage.getItem('deciThemePreference');
      });

      if (localStorageValue !== null) {
        expect(localStorageValue).toMatch('light');
      }
    }).toPass();
    await page.reload({ waitUntil: 'load' });
  });
});

test('Dashboard operations', async ({ randomFreeUser }) => {
  const { page } = randomFreeUser;

  await test.step('creates a new pad and navigates to pad detail', async () => {
    await Promise.all([
      clickNewPadButton(page),
      page.waitForNavigation({ url: '/n/*' }),
    ]);

    await page.goBack();
  });

  await test.step('can remove pad', async () => {
    const padIndex = (await getPadList(page)).findIndex(
      (pad) => pad.name !== 'My first pad'
    );
    expect(padIndex).toBeGreaterThanOrEqual(0);
    await removePad(page, padIndex);

    await expect(async () => {
      const pads = await getPadList(page);
      // eslint-disable-next-line no-unused-expressions, playwright/no-conditional-in-test
      process.env.CI || process.env.DECI_E2E
        ? expect(pads).toHaveLength(3)
        : expect(pads).toHaveLength(14);
    }).toPass();
  });

  await test.step('can duplicate pad', async () => {
    await duplicatePad(page);

    await expect(async () => {
      let pads = await getPadList(page);
      // eslint-disable-next-line no-unused-expressions, playwright/no-conditional-in-test
      process.env.CI
        ? expect(pads).toHaveLength(4)
        : expect(pads).toHaveLength(15);

      pads = await getPadList(page);
      const copyIndex = pads.findIndex((pad) =>
        pad.name?.startsWith('Copy of')
      );
      expect(copyIndex).toBeGreaterThanOrEqual(0);
    }).toPass();
  });

  await test.step('can navigate to pad detail', async () => {
    const pads = await getPadList(page);
    expect(pads.length).toBeGreaterThan(0);
    const pad = pads[0];
    await pad.anchor.click();
    expect(page.url()).toMatch(/\/n\/[^/]+/);
    await page.goBack();
  });
});

test('Workspace flows', async ({ randomFreeUser }) => {
  const { page } = randomFreeUser;

  await test.step('Archive & delete a notebook', async () => {
    await page.click(ellipsisSelector(0)); // click first ellipsis
    await page.click('div[role="menuitem"] span:has-text("Archive")');
    await page.click('aside nav > ul > li a span:has-text("Archived")');
    await page.click(ellipsisSelector(0)); // click first ellipsis
    await page.click('div[role="menuitem"] span:has-text("Delete")');
    await expect(page.getByText('No documents to list')).toBeVisible();
  });

  await test.step('Create a workspace', async () => {
    await page.getByTestId('workspace-selector-button').click();
    await page.getByTestId('create-workspace-button').click();
    await page.getByPlaceholder('Team workspace').click();
    await page.getByPlaceholder('Team workspace').fill('Wtf');
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    await expect(page.getByTestId('workspace-hero-title')).toHaveText(
      'Welcome toWtf'
    );
  });

  await test.step('Update name in the account settings modal', async () => {
    await page.getByTestId('account-settings-button').click();
    await page.getByTestId('user-name').fill('Joe Doe');
    await page.getByTestId('btn-create-modal').click();

    await expect(page.locator('[title="Joe Doe"]')).toHaveText('Joe Doe');

    await page.getByTestId('account-settings-button').click();

    await expect(page.getByTestId('user-name')).toHaveValue('Joe Doe');
  });

  await test.step('Update username in the account settings modal', async () => {
    const currentDate = Date.now();
    await page.getByTestId('user-username').fill(`joedoe${currentDate}`);
    await page.getByTestId('btn-create-modal').click();
    await page.getByTestId('account-settings-button').click();

    await expect(page.getByTestId('user-username')).toHaveValue(
      `@joedoe${currentDate}`
    );
  });
});
