import { ElementHandle } from 'playwright';
import { URL } from 'url';
import { withNewUser } from '../utils';

interface Pad {
  anchor: ElementHandle;
  name: string | null;
  href: string | null;
}

type PadList = Pad[];

export async function setUp() {
  await withNewUser();
  await navigateToWorkspacePage();
}

export async function navigateToWorkspacePage() {
  if (!new URL(page.url()).pathname.match(/\/workspaces\/[^/]+/)) {
    await page.goto('/');
    await page.waitForNavigation({ url: '/workspaces/*' });
  }
  await page.waitForSelector('text=workspace');
}

export async function getPadList(): Promise<PadList> {
  const anchors = await page.$$('a[href*="/pads/"]');
  const pads: PadList = [];
  for (const anchor of anchors) {
    pads.push({
      anchor,
      name: await anchor.textContent(),
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
  const removeButtons = await page.$$('[alt*="Remove Notebook"]');
  expect(removeButtons.length).toBeGreaterThanOrEqual(index);
  const removeButton = removeButtons[index];
  await Promise.all([page.waitForRequest('/graphql'), removeButton.click()]);
}

export async function duplicatePad(index = 0) {
  const duplicateButtons = await page.$$('[alt*="Duplicate Notebook"]');
  expect(duplicateButtons.length).toBeGreaterThanOrEqual(index);
  const duplicateButton = duplicateButtons[index];
  await Promise.all([page.waitForRequest('/graphql'), duplicateButton.click()]);
}
