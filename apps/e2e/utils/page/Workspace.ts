import { BrowserContext, ElementHandle, Page } from '@playwright/test';
import Zip from 'adm-zip';
import { readFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import os from 'os';
import path from 'path';
import { withTestUser } from '../src/with-test-user';

interface Pad {
  anchor: ElementHandle;
  name: string;
  href: string | null;
}

type PadList = Pad[];

function isOnWorkspacePage(page: Page): boolean {
  const url = page.url();
  return url.match(/\/w\//) !== null;
}

export async function navigateToWorkspacePage(page: Page) {
  if (!isOnWorkspacePage(page)) {
    await page.goto('/');
  }
  await page.waitForSelector('.notebookList > li');
}

interface SetupProps {
  page: Page;
  context: BrowserContext;
}

export async function setUp({ page, context }: SetupProps) {
  await page.goto('/api/auth/signout');
  await withTestUser({ page, context });
  await navigateToWorkspacePage(page);
}

export async function getPadList(page: Page): Promise<PadList> {
  // wait for notebooks to show up
  await page.waitForSelector('//main//li//a//strong');

  // eslint-disable-next-line playwright/no-element-handle
  const names = await page.$$('//main//li//a//strong');
  const pads: PadList = [];
  for (const name of names) {
    const anchor = (await name.evaluateHandle(
      (elem) => elem.closest('a')!
    )) as ElementHandle;
    pads.push({
      anchor,
      name: (await name.textContent()) ?? '',
      href: await anchor.getAttribute('href'),
    });
  }
  return pads;
}

function waitForDownload(page: Page): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      page.once('download', async (download) => {
        try {
          const filePath = path.join(os.tmpdir(), nanoid());
          await download.saveAs(filePath);
          resolve(await readFile(filePath));
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

export async function clickNewPadButton(page: Page) {
  await page.locator('text=/New Notebook/').click();
}

export const ellipsisSelector = (n: number): string => {
  return `//main//li >> nth=${n} >> div[type=button] svg`;
};

export async function removePad(page: Page, index = 0) {
  await page.click(ellipsisSelector(index));
  const removeButton = await page.waitForSelector(
    'div[role="menuitem"] span:has-text("Archive")'
  );
  await Promise.all([page.waitForRequest('/graphql'), removeButton.click()]);
}

export async function duplicatePad(page: Page, index = 0) {
  await page.click(ellipsisSelector(index));
  const duplicateButton = (await page.waitForSelector(
    'div[role="menuitem"] span:has-text("Duplicate")'
  ))!;
  await Promise.all([page.waitForRequest('/graphql'), duplicateButton.click()]);
}

export async function exportPad(page: Page, index = 0): Promise<string> {
  await page.click(ellipsisSelector(index));
  const exportButton = (await page.waitForSelector(
    'div[role="menuitem"] span:has-text("Download")'
  ))!;
  const [fileContent] = await Promise.all([
    waitForDownload(page),
    exportButton.click(),
  ]);
  const zip = new Zip(fileContent);
  const jsonEntry = zip.getEntry('notebook.json');
  if (!jsonEntry) {
    throw new Error('expected a notebook.json entry on the export');
  }
  const json = jsonEntry.getData();
  return json.toString('utf8');
}

export async function followPad(page: Page, index: number) {
  const pads = await getPadList(page);
  const href = pads[index]?.href;
  if (href) {
    await page.goto(href);
  }
}
