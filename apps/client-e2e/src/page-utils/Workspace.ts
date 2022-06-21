import { getDefined } from '@decipad/utils';
import { readFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import os from 'os';
import path from 'path';
import { ElementHandle, Page } from 'playwright';
import { URL } from 'url';
import waitForExpect from 'wait-for-expect';
import { withTestUser } from '../utils';

interface Pad {
  anchor: ElementHandle;
  name: string;
  href: string | null;
}

type PadList = Pad[];

function isOnWorkspacePage(page: Page | URL): boolean {
  const url = page instanceof URL ? page : new URL(page.url());
  return url.pathname.match(/^\/w\/[^/]+$/) !== null;
}

export async function navigateToWorkspacePage() {
  if (!isOnWorkspacePage(page)) {
    await page.goto('/');
    if (!isOnWorkspacePage(page)) {
      await page.waitForNavigation({
        url: isOnWorkspacePage,
      });
    }
  }
}

export async function setUp() {
  await withTestUser();
  await navigateToWorkspacePage();
}

export async function getPadList(): Promise<PadList> {
  // wait for notebooks to show up
  waitForExpect(async () => {
    expect(await page.$$('//main//li//a//strong')).not.toHaveLength(0);
  });

  const names = await page.$$('//main//li//a//strong');
  const pads: PadList = [];
  for (const name of names) {
    const anchor = await name.evaluateHandle((elem) => elem.closest('a')!);
    pads.push({
      anchor,
      name: (await name.textContent()) ?? '',
      href: await anchor.getAttribute('href'),
    });
  }
  return pads;
}

function waitForDownload(): Promise<Buffer> {
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

export async function clickNewPadButton() {
  await page.locator('text=/create notebook/i').click();
}

export async function removePad(index = 0) {
  await page.click(`//main//li[${index + 1}]//button`);
  const removeButton = (await page.$(`button:has-text("Delete")`))!;
  await Promise.all([page.waitForRequest('/graphql'), removeButton.click()]);
}

export async function duplicatePad(index = 0) {
  await page.click(`//main//li[${index + 1}]//button`);
  const duplicateButton = (await page.$(`button:has-text("Duplicate")`))!;
  await Promise.all([page.waitForRequest('/graphql'), duplicateButton.click()]);
}

export async function exportPad(index = 0): Promise<string> {
  await page.click(`//main//li[${index + 1}]//button`);
  const exportButton = (await page.$(`a:has-text("Export")`))!;
  const [fileContent] = await Promise.all([
    waitForDownload(),
    exportButton.click(),
  ]);
  return fileContent.toString('utf8');
}

export async function followPad(index: number) {
  const pads = await getPadList();
  await page.goto(getDefined(pads[index]?.href));
}
