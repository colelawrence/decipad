import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export const editorLocator = (): string => {
  return '[data-editorloaded][data-hydrated]';
};

export const editorTitleLocator = (): string => {
  return `[data-testid="notebook-title"]`;
};

export async function waitForEditorToLoad(page: Page) {
  await expect(async () => {
    await expect(page.getByTestId('notebook-title')).toBeVisible();
  }).toPass();
  await page.getByTestId('notebook-title').click();
}

export async function waitForNotebookToLoad(page: Page) {
  await expect(async () => {
    await expect(page.getByTestId('notebook-title')).toBeVisible();
  }).toPass();
}

export async function navigateToNotebook(page: Page, notebookId: string) {
  await page.goto(`/n/pad-title:${notebookId}`);
}
