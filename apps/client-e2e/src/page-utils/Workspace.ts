import { ElementHandle } from 'playwright';
import { URL } from 'url';
import { withNewUser } from '../utils';

interface Pad {
  anchor: ElementHandle;
  name: string;
  href: string | null;
}

type PadList = Pad[];

export async function navigateToWorkspacePage() {
  if (!new URL(page.url()).pathname.match(/\/workspaces\/[^/]+/)) {
    await page.goto('/');
    await page.waitForNavigation({ url: '/workspaces/*' });
  }
  await page.waitForSelector('text=workspace');
}

export async function setUp() {
  await withNewUser();
  await navigateToWorkspacePage();
}

export async function getPadList(): Promise<PadList> {
  const names = await page.$$('//main//li//a//strong');
  const pads: PadList = [];
  for (const name of names) {
    const anchor = await name.evaluateHandle((elem) => elem.closest('a'));
    pads.push({
      anchor,
      name: (await name.textContent()) ?? '',
      href: await anchor.getAttribute('href'),
    });
  }
  return pads;
}

export async function clickNewPadButton() {
  const createNewPadButton = await page.$('text=create new');
  expect(createNewPadButton).not.toBeNull();
  await createNewPadButton!.click();
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
