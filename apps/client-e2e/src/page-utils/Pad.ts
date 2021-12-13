import { ElementHandle } from 'playwright';
import { withNewUser, timeout } from '../utils';
import { getTagName } from './Page';
import { clickNewPadButton, navigateToWorkspacePage } from './Workspace';

interface PadElement {
  type: string;
  text: string;
}
type PadContent = PadElement[];

export async function waitForEditorToLoad() {
  await page.waitForSelector('h1[data-slate-node="element"]');
}

export async function setUp() {
  await withNewUser();
  await navigateToWorkspacePage();
  await Promise.all([
    clickNewPadButton(),
    page.waitForNavigation({ url: '/workspaces/*/pads/*' }),
  ]);
  await waitForEditorToLoad();
}

export async function getPadName() {
  const $name = await page.$('h1[data-slate-node="element"]');
  expect($name).not.toBeNull();
  return (await $name!.textContent())!.trim();
}

export async function getPadRoot($page = page): Promise<ElementHandle | null> {
  return $page.$('[data-slate-node="value"]');
}

export async function getPadContent($page = page) {
  const $padValue = await getPadRoot($page);
  expect($padValue).not.toBeNull();
  const $elements = await $padValue!.$$('[data-slate-node="element"]');
  const padContent: PadContent = [];
  for (const $element of $elements) {
    padContent.push({
      type: (await getTagName($element, $page)).toLowerCase(),
      text: (await $element.innerText()).trim(),
    });
  }
  return padContent;
}

export async function focusOnBody() {
  const $firstP = await page.$('p[data-slate-node="element"]');
  expect($firstP).not.toBeNull();
  await $firstP!.click();
}

export async function waitForSaveFlush() {
  await Promise.all([
    page.waitForLoadState('networkidle'),
    // TODO: this is bad. Should wait for local storage to flush instead.
    page.waitForTimeout(500),
  ]);
}

export async function keyPress(k: string) {
  await page.keyboard.press(k);
  await timeout(500);
}
