import type { Page } from '../manager/decipad-tests';
import { expect, test } from '../manager/decipad-tests';
import { Notebook } from '../manager/notebook';
import { Workspace } from '../manager/workspace';
import { Timeouts } from '../../utils/src';

test.describe.configure({ mode: 'serial' });

test.describe('staging performance checks', () => {
  let page: Page;
  let notebook: Notebook;
  let workspace: Workspace;

  const deployName = process.env.DEPLOY_NAME;
  const stagingURL =
    deployName === 'dev'
      ? 'https://dev.decipad.com'
      : `https://${deployName}.decipadstaging.com`;

  const currentDate = new Date().getTime();
  const notebookTitle =
    currentDate.toString() + Math.round(Math.random() * 10000);

  test('login', async ({ browser }) => {
    // get staging user agent string
    const userAgent = process.env.USER_AGENT_KEY;

    // Create a new browser context with the custom user agent
    const context = await browser.newContext({
      userAgent,
    });

    // Use the custom context to create a new page
    page = await context.newPage();

    notebook = new Notebook(page);
    workspace = new Workspace(page);
  });

  test('load workspace', async ({ performance }) => {
    performance.sampleStart('Load Workspace');
    await page.goto(stagingURL);
    await expect(page.getByText('Welcome to').first()).toBeVisible();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    performance.sampleEnd('Load Workspace');
    expect
      .soft(
        performance.getSampleTime('Load Workspace'),
        'Loading workspace took more than 10 seconds'
      )
      .toBeLessThanOrEqual(10000);
  });

  test('new notebook', async ({ performance }) => {
    performance.sampleStart('New Notebook');
    await workspace.clickNewPadButton();
    await notebook.waitForEditorToLoad();
    performance.sampleEnd('New Notebook');
    expect
      .soft(
        performance.getSampleTime('New Notebook'),
        'Creating a Notebook took more than 8 seconds'
      )
      .toBeLessThanOrEqual(8000);
  });

  test('checks csv uploads work', async ({ performance }) => {
    await test.step('importing csv link through csv panel with link', async () => {
      await notebook.updateNotebookTitle(notebookTitle);
      await notebook.closeSidebar();
      await notebook.waitForEditorToLoad();
      await notebook.selectLastParagraph();

      performance.sampleStart('Ingest CSV');

      await notebook.addCSV({
        method: 'link',
        link: 'https://docs.google.com/spreadsheets/d/1rEnsyZJuGdBLeq2O8lOAJShK6rI8L1CM-g6NjNul1dg/pub?gid=885366347&single=true&output=csv',
        varName: 'Customers',
      });

      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(async () => {
        await expect(
          page.getByTestId('live-code').getByTestId('loading-animation').first()
        ).toBeHidden();
      }).toPass({
        timeout: 1000,
      });
      await expect(
        page.getByText('4999 rows, previewing rows 1 to 10')
      ).toBeVisible();
    });
    performance.sampleEnd('Ingest CSV');
    expect
      .soft(
        performance.getSampleTime('Ingest CSV'),
        'CSV Ingest took more than 50 seconds'
      )
      .toBeLessThanOrEqual(50_000);
  });

  test('checks reducers from imports', async ({ performance }) => {
    // count
    performance.sampleStart('Reducers count');
    await notebook.addFormula('countCustomers', 'count(Customers.CustomerId');
    performance.sampleStart('Reducers count');
    await expect(
      page
        .getByTestId('codeline-code')
        .last()
        .getByTestId('code-line-result:4999')
    ).toBeVisible();

    performance.sampleEnd('Reducers count');
    expect
      .soft(
        performance.getSampleTime('Reducers count'),
        'Reducers count took more than 3 second'
      )
      .toBeLessThanOrEqual(3_000);

    // min
    performance.sampleStart('Reducers min');
    await notebook.addFormula('minCustomers', 'min(Customers.RandomNumber');
    performance.sampleStart('Reducers min');
    await expect(
      page
        .getByTestId('codeline-code')
        .last()
        .getByTestId('code-line-result:9322')
    ).toBeVisible();

    performance.sampleEnd('Reducers min');
    expect
      .soft(
        performance.getSampleTime('Reducers min'),
        'Reducers min took more than 3 second'
      )
      .toBeLessThanOrEqual(3_000);

    // max
    performance.sampleStart('Reducers max');
    await notebook.addFormula('maxCustomers', 'max(Customers.RandomNumber');
    performance.sampleStart('Reducers max');
    await expect(
      page
        .getByTestId('codeline-code')
        .last()
        .getByTestId('code-line-result:99977244')
    ).toBeVisible();

    performance.sampleEnd('Reducers max');
    expect
      .soft(
        performance.getSampleTime('Reducers max'),
        'Reducers max took more than 3 second'
      )
      .toBeLessThanOrEqual(3_000);

    // average
    performance.sampleStart('Reducers average');
    await notebook.addFormula(
      'averageCustomers',
      'average(Customers.RandomNumber'
    );
    performance.sampleStart('Reducers average');
    await expect(
      page
        .getByTestId('codeline-code')
        .last()
        .getByTestId(
          'code-line-result:49310004.(712342468493698739747949589917983596719343868773754750950190038007601520304060812162432486497299459891978395679135827165433086617323464692938587717543508701740348069613922784556911382276455291058211642328465693138627725545109021804360872174434886977395479095819163832766553310662132426485297059411882376475295059011802360472094418883776755351070214042808561)'
        )
    ).toBeVisible();

    performance.sampleEnd('Reducers average');
    expect
      .soft(
        performance.getSampleTime('Reducers average'),
        'Reducers average took more than 3 second'
      )
      .toBeLessThanOrEqual(3_000);

    // meadian
    performance.sampleStart('Reducers median');
    await notebook.addFormula(
      'medianCustomers',
      'median(Customers.RandomNumber'
    );
    performance.sampleStart('Reducers median');
    await expect(
      page
        .getByTestId('codeline-code')
        .last()
        .getByTestId('code-line-result:48239232')
    ).toBeVisible();

    performance.sampleEnd('Reducers median');
    expect
      .soft(
        performance.getSampleTime('Reducers median'),
        'Reducers median took more than 3 second'
      )
      .toBeLessThanOrEqual(3_000);

    // sum
    performance.sampleStart('Reducers sum');
    await notebook.addFormula('sumCustomers', 'sum(Customers.RandomNumber');
    performance.sampleStart('Reducers sum');
    await expect(
      page
        .getByTestId('codeline-code')
        .last()
        .getByTestId('code-line-result:246500713557')
    ).toBeVisible();

    performance.sampleEnd('Reducers sum');
    expect
      .soft(
        performance.getSampleTime('Reducers sum'),
        'Reducers sum took more than 3 second'
      )
      .toBeLessThanOrEqual(3_000);

    // sumif
    performance.sampleStart('Reducers sumif');
    await notebook.addFormula(
      'sumifCustomers',
      'sumif(Customers.RandomNumber, Customers.RandomNumber < 5'
    );
    performance.sampleStart('Reducers sumif');
    await expect(
      page.getByTestId('codeline-code').last().getByTestId('code-line-result:0')
    ).toBeVisible();

    performance.sampleEnd('Reducers sum');
    expect
      .soft(
        performance.getSampleTime('Reducers sum'),
        'Reducers sum took more than 3 second'
      )
      .toBeLessThanOrEqual(3_000);
  });

  test('text formatter with mouse', async ({}) => {
    await notebook.focusOnBody();
    await notebook.selectLastParagraph();
    await expect(
      page.getByText('4999 rows, previewing rows 1 to 10')
    ).toBeVisible();
    await expect(
      page
        .getByRole('textbox')
        .locator('div')
        .filter({ hasText: 'Customers' })
        .first()
    ).toBeVisible();
    await page.keyboard.type('this is the content for the first paragraph');
    await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      'this is the content for the first paragraph'
    );

    // text that will be selected by the mouse
    const p = page.getByText('for the first par');

    // Get the bounding box of the paragraph
    const box = await p.boundingBox();

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (box) {
      // Calculate positions for the selection
      const startX = box.x + 130; // approximate position before "for"
      const startY = box.y + box.height / 2;
      const endX = box.x + 230; // approximate position after "the first"
      const endY = startY;

      // Simulate mouse actions to select "for the first"
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY);
      await page.mouse.up();
    } else {
      throw new Error('Failed to retrieve bounding box for the paragraph');
    }

    // checks the actual text style.
    const beforeTextStyles = await p.evaluate((element) => [
      window.getComputedStyle(element).getPropertyValue('font-weight'),
      window.getComputedStyle(element).getPropertyValue('font-style'),
    ]);

    await page.click('button:has-text("Bold")');
    await page.click('button:has-text("Italic")');

    // checks the actual text style.
    const textStyles = await p.evaluate((element) => [
      window.getComputedStyle(element).getPropertyValue('font-weight'),
      window.getComputedStyle(element).getPropertyValue('font-style'),
    ]);

    // compare the before styles with the current styles.
    expect(textStyles[0] > beforeTextStyles[0]).toBe(true);
    expect(textStyles[1] !== beforeTextStyles[1]).toBe(true);
  });
});

test.describe('data views', () => {
  let page: Page;
  let notebook: Notebook;
  let workspace: Workspace;

  const deployName = process.env.DEPLOY_NAME;
  const stagingURL =
    deployName === 'dev'
      ? 'https://dev.decipad.com'
      : `https://${deployName}.decipadstaging.com`;

  const currentDate = new Date().getTime();
  const notebookTitle =
    currentDate.toString() + Math.round(Math.random() * 10000);

  test('login', async ({ browser }) => {
    // get staging user agent string
    const userAgent = process.env.USER_AGENT_KEY;

    // Create a new browser context with the custom user agent
    const context = await browser.newContext({
      userAgent,
    });

    // Use the custom context to create a new page
    page = await context.newPage();

    notebook = new Notebook(page);
    workspace = new Workspace(page);
  });

  test('load workspace', async ({ performance }) => {
    performance.sampleStart('Load Workspace');
    await page.goto(stagingURL);
    await expect(page.getByText('Welcome to').first()).toBeVisible();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    performance.sampleEnd('Load Workspace');
    expect
      .soft(
        performance.getSampleTime('Load Workspace'),
        'Loading workspace took more than 10 seconds'
      )
      .toBeLessThanOrEqual(10000);
  });

  test('new notebook', async ({ performance }) => {
    performance.sampleStart('New Notebook');
    await workspace.clickNewPadButton();
    await notebook.waitForEditorToLoad();
    performance.sampleEnd('New Notebook');
    expect
      .soft(
        performance.getSampleTime('New Notebook'),
        'Creating a Notebook took more than 8 seconds'
      )
      .toBeLessThanOrEqual(8000);
  });

  test('checks csv uploads work', async ({ performance }) => {
    await test.step('importing csv link through csv panel with link', async () => {
      await notebook.updateNotebookTitle(notebookTitle);
      await notebook.closeSidebar();
      await notebook.waitForEditorToLoad();
      await notebook.selectLastParagraph();

      performance.sampleStart('Ingest CSV');

      await notebook.addCSV({
        method: 'link',
        link: 'https://docs.google.com/spreadsheets/d/1rEnsyZJuGdBLeq2O8lOAJShK6rI8L1CM-g6NjNul1dg/pub?gid=885366347&single=true&output=csv',
        varName: 'Customers',
      });

      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(async () => {
        await expect(
          page.getByTestId('live-code').getByTestId('loading-animation').first()
        ).toBeHidden();
      }).toPass({
        timeout: 1000,
      });
      await expect(
        page.getByText('4999 rows, previewing rows 1 to 10')
      ).toBeVisible();
    });
    performance.sampleEnd('Ingest CSV');
    expect
      .soft(
        performance.getSampleTime('Ingest CSV'),
        'CSV Ingest took more than 50 seconds'
      )
      .toBeLessThanOrEqual(50_000);
  });

  // eslint-disable-next-line playwright/no-skipped-test
  test('creates a data view', async ({ performance }) => {
    performance.sampleStart('Adding Data View');
    await page.getByText('Pivot view').click();

    await expect(page.getByText(/Data/)).toBeVisible();
    performance.sampleEnd('Adding Data View');
    expect
      .soft(
        performance.getSampleTime('Adding Data View'),
        'Adding Data View took more than 15 seconds'
      )
      .toBeLessThanOrEqual(15_000);

    await notebook.checkCalculationErrors();

    performance.sampleStart('Add Data View Column');
    await expect(page.getByTestId('add-data-view-column-button')).toBeVisible();
    await page.getByTestId('add-data-view-column-button').click();
    await page.getByRole('menuitem', { name: 'Country' }).click();
    await expect(async () => {
      await expect(page.getByText('Page 1 of 5')).toBeVisible();
    }).toPass();
    performance.sampleEnd('Add Data View Column');
    expect
      .soft(
        performance.getSampleTime('Add Data View Column'),
        'Adding Data View Column took more than 30 seconds'
      )
      .toBeLessThanOrEqual(40_000);

    /*
    Data views for 10k rows don't work well still, this will be the next step

    await test.step('importing csv link through csv panel with link', async () => {
      performance.sampleStart('Aggregation Data View');
      await page.getByTestId('data-view-options-menu-Country').click();
      await page.getByRole('menuitem', { name: 'Aggregate' }).click();
      await page.getByRole('menuitem', { name: 'Count values' }).click();
      await expect(page.getByText('10K')).toBeVisible();
      performance.sampleEnd('Aggregation Data View');
      expect
        .soft(
          performance.getSampleTime('Aggregation Data View'),
          'Data View Aggregation took more than 10 seconds'
        )
        .toBeLessThanOrEqual(10_000);
    });
*/
    await notebook.checkCalculationErrors();
  });
});

test.describe('staging operation performance checks', () => {
  let page: Page;
  let notebook: Notebook;
  let workspace: Workspace;

  const deployName = process.env.DEPLOY_NAME;
  const stagingURL =
    deployName === 'dev'
      ? 'https://dev.decipad.com'
      : `https://${deployName}.decipadstaging.com`;

  const currentDate = new Date().getTime();
  const notebookTitle =
    currentDate.toString() + Math.round(Math.random() * 10000);

  test('login', async ({ browser }) => {
    // get staging user agent string
    const userAgent = process.env.USER_AGENT_KEY;

    // Create a new browser context with the custom user agent
    const context = await browser.newContext({
      userAgent,
    });

    // Use the custom context to create a new page
    page = await context.newPage();

    notebook = new Notebook(page);
    workspace = new Workspace(page);
  });

  test('load workspace', async ({ performance }) => {
    performance.sampleStart('Load Workspace');
    await page.goto(stagingURL);
    await expect(page.getByText('Welcome to').first()).toBeVisible();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    performance.sampleEnd('Load Workspace');
    expect
      .soft(
        performance.getSampleTime('Load Workspace'),
        'Loading workspace took more than 10 seconds'
      )
      .toBeLessThanOrEqual(10000);
  });

  test('new notebook', async ({ performance }) => {
    performance.sampleStart('New Notebook');
    await workspace.clickNewPadButton();
    await notebook.waitForEditorToLoad();
    performance.sampleEnd('New Notebook');
    expect
      .soft(
        performance.getSampleTime('New Notebook'),
        'Creating a Notebook took more than 8 seconds'
      )
      .toBeLessThanOrEqual(8000);
  });

  test('checks csv uploads work', async ({ performance }) => {
    await test.step('importing csv link through csv panel with link', async () => {
      await notebook.updateNotebookTitle(notebookTitle);
      await notebook.closeSidebar();
      await notebook.waitForEditorToLoad();
      await notebook.selectLastParagraph();

      performance.sampleStart('Ingest CSV');

      await notebook.addCSV({
        method: 'link',
        link: 'https://docs.google.com/spreadsheets/d/1rEnsyZJuGdBLeq2O8lOAJShK6rI8L1CM-g6NjNul1dg/pub?gid=885366347&single=true&output=csv',
        varName: 'Customers',
      });

      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(async () => {
        await expect(
          page.getByTestId('live-code').getByTestId('loading-animation').first()
        ).toBeHidden();
      }).toPass({
        timeout: 1000,
      });
      await expect(
        page.getByText('4999 rows, previewing rows 1 to 10')
      ).toBeVisible();
    });
    performance.sampleEnd('Ingest CSV');
    expect
      .soft(
        performance.getSampleTime('Ingest CSV'),
        'CSV Ingest took more than 50 seconds'
      )
      .toBeLessThanOrEqual(50_000);
  });

  test('checks operations from imports', async ({ performance }) => {
    await test.step('Operations column + number unitless', async () => {
      performance.sampleStart('Operations column + number unitless');
      await notebook.addFormula(
        'columnaddunitlessnumberCustomers',
        'Customers.RandomNumber+1025'
      );
      performance.sampleStart('Operations column + number unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByTestId('number-result:≈89.48 million')
      ).toBeVisible();

      performance.sampleEnd('Operations column + number unitless');
      expect
        .soft(
          performance.getSampleTime('Operations column + number unitless'),
          'Operations column + number unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column + another column unitless', async () => {
      performance.sampleStart('Operations column + another column unitless');
      await notebook.addFormula(
        'columnaddunitlesscolumnCustomers',
        'Customers.RandomNumber+Customers.RandomNumber'
      );
      performance.sampleStart('Operations column + another column unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByTestId('number-result:≈178.97 million')
      ).toBeVisible();

      performance.sampleEnd('Operations column + another column unitless');
      expect
        .soft(
          performance.getSampleTime(
            'Operations column + another column unitless'
          ),
          'Operations column + another column unitless took more than 4 seconds'
        )
        .toBeLessThanOrEqual(4_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column - number unitless', async () => {
      performance.sampleStart('Operations column - number unitless');
      await notebook.addFormula(
        'columnaddunitlessnumberCustomers',
        'Customers.RandomNumber-1025'
      );
      performance.sampleStart('Operations column - number unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByTestId('number-result:≈89.48 million')
      ).toBeVisible();

      performance.sampleEnd('Operations column - number unitless');
      expect
        .soft(
          performance.getSampleTime('Operations column - number unitless'),
          'Operations column - number unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column - another column unitless', async () => {
      performance.sampleStart('Operations column - another column unitless');
      await notebook.addFormula(
        'columnaddunitlesscolumnCustomers',
        'Customers.RandomNumber-Customers.RandomNumber'
      );
      performance.sampleStart('Operations column - another column unitless');
      await page.getByText('Show data').last().click();
      await expect(page.getByTestId('number-result:0').last()).toBeVisible();

      performance.sampleEnd('Operations column - another column unitless');
      expect
        .soft(
          performance.getSampleTime(
            'Operations column - another column unitless'
          ),
          'Operations column - another column unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column * number unitless', async () => {
      performance.sampleStart('Operations column * number unitless');
      await notebook.addFormula(
        'columnmulunitlessnumberCustomers',
        'Customers.RandomNumber*1025'
      );
      performance.sampleStart('Operations column * number unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByTestId('number-result:≈91.72 billion')
      ).toBeVisible();

      performance.sampleEnd('Operations column * number unitless');
      expect
        .soft(
          performance.getSampleTime('Operations column * number unitless'),
          'Operations column * number unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column * another column unitless', async () => {
      performance.sampleStart('Operations column * another column unitless');
      await notebook.addFormula(
        'columnmulunitlesscolumnCustomers',
        'Customers.RandomNumber*Customers.RandomNumber'
      );
      performance.sampleStart('Operations column * another column unitless');
      await page.getByText('Show data').last().click();
      await expect(page.getByTestId('number-result:≈8.01×10¹⁵')).toBeVisible();

      performance.sampleEnd('Operations column * another column unitless');
      expect
        .soft(
          performance.getSampleTime(
            'Operations column * another column unitless'
          ),
          'Operations column * another column unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column / number unitless', async () => {
      performance.sampleStart('Operations column / number unitless');
      await notebook.addFormula(
        'columndivideunitlessnumberCustomers',
        'Customers.RandomNumber/1025'
      );
      performance.sampleStart('Operations column / number unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByTestId('number-result:≈87.3 thousand')
      ).toBeVisible();

      performance.sampleEnd('Operations column / number unitless');
      expect
        .soft(
          performance.getSampleTime('Operations column / number unitless'),
          'Operations column * number unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column / another column unitless', async () => {
      performance.sampleStart('Operations column / another column unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber/Customers.RandomNumber'
      );
      performance.sampleStart('Operations column / another column unitless');
      await page.getByText('Show data').last().click();
      await expect(page.getByTestId('number-result:1')).toBeVisible();

      performance.sampleEnd('Operations column / another column unitless');
      expect
        .soft(
          performance.getSampleTime(
            'Operations column / another column unitless'
          ),
          'Operations column / another column unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column > number unitless', async () => {
      performance.sampleStart('Operations column > number unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber > 1'
      );
      performance.sampleStart('Operations column > number unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxSelected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column > number unitless');
      expect
        .soft(
          performance.getSampleTime('Operations column > number unitless'),
          'Operations column > number unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column > another column unitless', async () => {
      performance.sampleStart('Operations column > another column unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber > Customers.RandomNumber'
      );
      performance.sampleStart('Operations column > another column unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxUnselected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column > another column unitless');
      expect
        .soft(
          performance.getSampleTime(
            'Operations column > another column unitless'
          ),
          'Operations column > another column unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column >= number unitless', async () => {
      performance.sampleStart('Operations column >= number unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber >= 1'
      );
      performance.sampleStart('Operations column >= number unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxSelected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column >= number unitless');
      expect
        .soft(
          performance.getSampleTime('Operations column >= number unitless'),
          'Operations column >= number unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column >= another column unitless', async () => {
      performance.sampleStart('Operations column >= another column unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber >= Customers.RandomNumber'
      );
      performance.sampleStart('Operations column  >= another column unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxSelected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column  >= another column unitless');
      expect
        .soft(
          performance.getSampleTime(
            'Operations column  >= another column unitless'
          ),
          'Operations column >= another column unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column < number unitless', async () => {
      performance.sampleStart('Operations column < number unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber < 1'
      );
      performance.sampleStart('Operations column < number unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxUnselected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column < number unitless');
      expect
        .soft(
          performance.getSampleTime('Operations column < number unitless'),
          'Operations column < number unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column < another column unitless', async () => {
      performance.sampleStart('Operations column < another column unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber < Customers.RandomNumber'
      );
      performance.sampleStart('Operations column < another column unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxUnselected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column < another column unitless');
      expect
        .soft(
          performance.getSampleTime(
            'Operations column < another column unitless'
          ),
          'Operations column < another column unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column <= number unitless', async () => {
      performance.sampleStart('Operations column  <= number unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber <= 1'
      );
      performance.sampleStart('Operations column  <= number unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxUnselected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column  <= number unitless');
      expect
        .soft(
          performance.getSampleTime('Operations column  <= number unitless'),
          'Operations column <= number unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column <= another column unitless', async () => {
      performance.sampleStart('Operations column <= another column unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber <= Customers.RandomNumber'
      );
      performance.sampleStart('Operations column <= another column unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxSelected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column <= another column unitless');
      expect
        .soft(
          performance.getSampleTime(
            'Operations column <= another column unitless'
          ),
          'Operations column <= another column unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column == number unitless', async () => {
      performance.sampleStart('Operations column  == number unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber == 1'
      );
      performance.sampleStart('Operations column == number unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxUnselected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column == number unitless');
      expect
        .soft(
          performance.getSampleTime('Operations column == number unitless'),
          'Operations column == number unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column == another column unitless', async () => {
      performance.sampleStart('Operations column == another column unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber == Customers.RandomNumber'
      );
      performance.sampleStart('Operations column == another column unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxSelected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column == another column unitless');
      expect
        .soft(
          performance.getSampleTime(
            'Operations column == another column unitless'
          ),
          'Operations column == another column unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column != number unitless', async () => {
      performance.sampleStart('Operations column  != number unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber != 1'
      );
      performance.sampleStart('Operations column != number unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxSelected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column != number unitless');
      expect
        .soft(
          performance.getSampleTime('Operations column != number unitless'),
          'Operations column != number unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Operations column != another column unitless', async () => {
      performance.sampleStart('Operations column != another column unitless');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'Customers.RandomNumber != Customers.RandomNumber'
      );
      performance.sampleStart('Operations column != another column unitless');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByRole('row', { name: /CheckboxUnselected/ }).first()
      ).toBeVisible();

      performance.sampleEnd('Operations column != another column unitless');
      expect
        .soft(
          performance.getSampleTime(
            'Operations column != another column unitless'
          ),
          'Operations column != another column unitless took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Functions column filter() number', async () => {
      performance.sampleStart('Functions column filter() number');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'filter(Customers, Customers.RandomNumber < 89482752'
      );
      performance.sampleStart('Functions column filter() number');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByText('4477 rows, previewing rows 1 to 10')
      ).toBeVisible();

      performance.sampleEnd('Functions column filter() number');
      expect
        .soft(
          performance.getSampleTime('Functions column filter() number'),
          'Functions column filter() number took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Functions column lookup() number', async () => {
      performance.sampleStart('Functions column lookup() number');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'filter(Customers, Customers.RandomNumber == 44967639'
      );
      performance.sampleStart('Functions column lookup() number');
      await page.getByText('Show data').last().click();
      await expect(page.getByTestId('text-result:Teresa')).toBeVisible();

      performance.sampleEnd('Functions column lookup() number');
      expect
        .soft(
          performance.getSampleTime('Functions column lookup() number'),
          'Functions column lookup() number took more than 3 second'
        )
        .toBeLessThanOrEqual(3_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });

    await test.step('Functions column sortby() number', async () => {
      performance.sampleStart('Functions column sortby() number');
      await notebook.addFormula(
        'columndivideunitlesscolumnCustomers',
        'sortby(Customers, Customers.SubscriptionDate'
      );
      performance.sampleStart('Functions column sortby() number');
      await page.getByText('Show data').last().click();
      await expect(
        page.getByTestId('number-result:≈13.91 million')
      ).toBeVisible();

      performance.sampleEnd('Functions column sortby() number');
      expect
        .soft(
          performance.getSampleTime('Functions column sortby() number'),
          'Functions column sortby() number took more than 10 second'
        )
        .toBeLessThanOrEqual(10_000);
      await page.getByText('Hide data').last().click();
      await notebook.deleteBlock(2);
    });
  });
});

test.describe('sidebar opens for each new notebook', () => {
  let page: Page;
  let notebook: Notebook;
  let workspace: Workspace;

  const deployName = process.env.DEPLOY_NAME;
  const stagingURL =
    deployName === 'dev'
      ? 'https://dev.decipad.com'
      : `https://${deployName}.decipadstaging.com`;

  test('login', async ({ browser }) => {
    // get staging user agent string
    const userAgent = process.env.USER_AGENT_KEY;

    // Create a new browser context with the custom user agent
    const context = await browser.newContext({
      userAgent,
    });

    // Use the custom context to create a new page
    page = await context.newPage();

    notebook = new Notebook(page);
    workspace = new Workspace(page);
  });

  test('load workspace', async ({ performance }) => {
    performance.sampleStart('Load Workspace');
    await page.goto(stagingURL);
    await expect(page.getByText('Welcome to').first()).toBeVisible();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    performance.sampleEnd('Load Workspace');
    expect
      .soft(
        performance.getSampleTime('Load Workspace'),
        'Loading workspace took more than 10 seconds'
      )
      .toBeLessThanOrEqual(10000);
  });

  test('new notebook', async ({ performance }) => {
    performance.sampleStart('New Notebook');
    await workspace.clickNewPadButton();
    await notebook.waitForEditorToLoad();
    performance.sampleEnd('New Notebook');
    expect
      .soft(
        performance.getSampleTime('New Notebook'),
        'Creating a Notebook took more than 8 seconds'
      )
      .toBeLessThanOrEqual(8000);
  });
  test('check sidebar', async ({}) => {
    const e2eFlags = {
      NAV_SIDEBAR: false,
    };
    const flags = JSON.stringify(e2eFlags);

    await page.evaluate(
      (f) => localStorage.setItem('deciFeatureFlags', f),
      flags
    );

    await page.reload();

    await notebook.returnToWorkspace();
    await workspace.createNewNotebook();

    // check the sidebar opens the first time
    await expect(page.getByTestId('editor-sidebar')).toBeVisible();
    await expect(page.getByPlaceholder('Search for blocks...')).toBeVisible();

    await notebook.returnToWorkspace();
    await workspace.createNewNotebook();

    // checks the sidebar opens a scond time time
    await expect(
      page.getByTestId('editor-sidebar'),
      "the sidebar didn't open by default as it should when you create a second notebook"
    ).toBeVisible();
    await expect(page.getByPlaceholder('Search for blocks...')).toBeVisible();
  });
});
