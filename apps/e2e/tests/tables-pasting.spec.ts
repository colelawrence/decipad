import { expect, test } from './manager/decipad-tests';
import {
  createTable,
  getFromTable,
  deleteTable,
  pasteHtmlIntoCell,
  clickCell,
  pastePlainTextIntoCell,
} from '../utils/page/Table';

test('Table Pasting', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('creates table', async () => {
    await notebook.focusOnBody();
    await createTable(page);
  });

  await test.step('pastes tabular data starting from header cell', async () => {
    await pasteHtmlIntoCell(
      page,
      '<table>' +
        '<tr><td>firstHeader</td><td>secondHeader</td></tr>' +
        '<tr><td>one</td><td>two</td></tr>' +
        '</table>',
      0,
      0
    );

    expect(await getFromTable(page, 0, 0)).toBe('firstHeader');
    expect(await getFromTable(page, 0, 1)).toBe('secondHeader');
    expect(await getFromTable(page, 1, 0)).toBe('one');
    expect(await getFromTable(page, 1, 1)).toBe('two');
  });

  await test.step('pastes tabular data starting from data cell', async () => {
    await deleteTable(page);
    await createTable(page);

    await pasteHtmlIntoCell(
      page,
      '<table>' +
        '<tr><td>one</td><td>two</td></tr>' +
        '<tr><td>three</td><td>four</td></tr>' +
        '</table>',
      1,
      0
    );

    expect(await getFromTable(page, 1, 0)).toBe('one');
    expect(await getFromTable(page, 1, 1)).toBe('two');
    expect(await getFromTable(page, 2, 0)).toBe('three');
    expect(await getFromTable(page, 2, 1)).toBe('four');
  });

  await test.step('pastes tabular data into bottom-right corner of table', async () => {
    await deleteTable(page);
    await createTable(page);

    await pasteHtmlIntoCell(
      page,
      '<table>' +
        '<tr><td>one</td><td>two</td></tr>' +
        '<tr><td>three</td><td>four</td></tr>' +
        '</table>',
      3,
      2
    );

    expect(await getFromTable(page, 3, 2)).toBe('one');
    expect(await getFromTable(page, 3, 3)).toBe('two');
    expect(await getFromTable(page, 4, 2)).toBe('three');
    expect(await getFromTable(page, 4, 3)).toBe('four');
  });

  await test.step('pasting overwrites existing cells', async () => {
    await pasteHtmlIntoCell(
      page,
      '<table>' +
        '<tr><td>a1</td><td>b1</td></tr>' +
        '<tr><td>c1</td><td>d2</td></tr>' +
        '</table>',
      0,
      0
    );

    await pasteHtmlIntoCell(
      page,
      '<table>' +
        '<tr><td>a2</td><td>b2</td></tr>' +
        '<tr><td>c2</td><td>d2</td></tr>' +
        '</table>',
      0,
      0
    );

    expect(await getFromTable(page, 0, 0)).toBe('a2');
    expect(await getFromTable(page, 0, 1)).toBe('b2');
    expect(await getFromTable(page, 1, 0)).toBe('c2');
    expect(await getFromTable(page, 1, 1)).toBe('d2');
  });

  await test.step('pastes plain text into collapsed cell selection', async () => {
    await deleteTable(page);
    await createTable(page);
    await pastePlainTextIntoCell(page, 'Hello world', 2, 1);
    expect(await getFromTable(page, 2, 1)).toBe('Hello world');
  });

  await test.step('pastes html text into collapsed cell selection', async () => {
    await deleteTable(page);
    await createTable(page);
    await pasteHtmlIntoCell(page, '<div>Hello world</div>', 2, 1);
    expect(await getFromTable(page, 2, 1)).toBe('Hello world');
  });

  await test.step('pastes plain text into expanded forward cell selection', async () => {
    await deleteTable(page);
    await createTable(page);

    // Anchor in middle cell, focus to the right of it
    await clickCell(page, 2, 1);
    await page.keyboard.down('Shift');
    await clickCell(page, 2, 2);
    await page.keyboard.up('Shift');

    await pastePlainTextIntoCell(page, 'Hello world', 2, 1, false);
    expect(await getFromTable(page, 2, 1)).toBe('Hello world');
  });

  await test.step('pastes plain text into expanded backward cell selection', async () => {
    await deleteTable(page);
    await createTable(page);

    // Anchor in middle cell, focus to the left of it
    await clickCell(page, 2, 1);
    await page.keyboard.down('Shift');
    await clickCell(page, 2, 0);
    await page.keyboard.up('Shift');

    await pastePlainTextIntoCell(page, 'Hello world', 2, 1, false);
    expect(await getFromTable(page, 2, 1)).toBe('Hello world');
  });
});
