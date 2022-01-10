import { ElementHandle } from 'playwright';
import { withNewUser, timeout } from '../utils';
import { clickNewPadButton, navigateToWorkspacePage } from './Workspace';
import { navigateToPlayground } from './Playground';

export async function waitForEditorToLoad() {
  await page.waitForSelector('[contenteditable] h1');
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

export async function goToPlayground() {
  await navigateToPlayground();
  await waitForEditorToLoad();
}

export async function getPadName() {
  const $name = await page.$('[contenteditable] h1');
  await page.pause();
  expect($name).not.toBeNull();
  return (await $name!.textContent())!.trim();
}

export async function getPadRoot($page = page): Promise<ElementHandle | null> {
  return $page.$('[data-slate-node="value"]');
}

export async function focusOnBody() {
  const $firstP = await page.$('[contenteditable] p');
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

export async function createTable() {
  await keyPress('ArrowDown');
  await keyPress('Enter'); // And make a new line
  await page.keyboard.type('/table');
  await keyPress('Tab');
  await keyPress('Enter');
}

export async function writeInTable(text: string, columns = 1) {
  //
  // you need two tabs to get to the next value
  // when you have one column
  // spread is just to get a range from 0 to columns + 1
  //
  const tabs = [...Array(columns + 1).keys()].map(() => {
    return keyPress('Tab');
  });
  await Promise.all(tabs);
  await page.keyboard.type(text);
}

export async function createCalculationBlock(decilang: string) {
  await keyPress('ArrowDown');
  await keyPress('Enter'); // And make a new line
  await page.keyboard.type('/calc');
  await keyPress('Tab');
  await keyPress('Enter');
  await page.keyboard.type(decilang);
  await keyPress('ArrowDown');
}
