import waitForExpect from 'wait-for-expect';

export async function createTable() {
  await page.click('[contenteditable] p >> nth=-1');

  await page.keyboard.insertText('/table');

  await waitForExpect(async () =>
    expect(
      await page.$$('[contenteditable] [role="menuitem"]')
    ).not.toHaveLength(0)
  );

  await page.click('text=tableslashTableA table to structure your data');
  await page.waitForSelector('[contenteditable] table');
}

export function tableRowLocator(line: number) {
  const parentType = line === 0 ? 'thead' : 'tbody';
  const lineNumber = line > 0 ? line - 1 : line;
  return `table > ${parentType} > tr:nth-child(${lineNumber + 1})`;
}

export function tableCellLocator(line: number, col = 0) {
  const cellType = line === 0 ? 'th' : 'td';
  return `${tableRowLocator(line)} > ${cellType}:nth-child(${col + 2})`;
}

export function tableCellTextLocator(line: number, col = 0) {
  return `${tableCellLocator(line, col)} span[data-slate-string="true"]`;
}

export async function getFromTable(line: number, col = 0, formula = false) {
  return page
    .locator(
      formula ? tableCellLocator(line, col) : tableCellTextLocator(line, col)
    )
    .textContent();
}

export function clickCell(line: number, col = 0) {
  return page.locator(tableCellLocator(line, col)).click();
}

export async function writeInTable(text: string, line: number, col = 0) {
  await clickCell(line, col);
  await page.keyboard.type(text);
}

export function openRowMenu(line: number) {
  return page
    .locator(`${tableRowLocator(line)} > th > div > button:nth-child(2)`)
    .click();
}

export function addRow() {
  return page
    .locator('table > tfoot > tr > td > button')
    .click({ force: true });
}

export async function addColumn() {
  await page.locator('button[title="Add Column"]').click({ force: true });
  await page.waitForTimeout(1000);
}

export function openColumnMenu(col: number) {
  return page.click(
    `${tableRowLocator(0)} > th:nth-child(${
      col + 2
    }) button:has-text("Caret down")`
  );
}
