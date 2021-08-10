import { ElementHandle } from 'playwright';

export async function getTagName(element: ElementHandle): Promise<string> {
  return await page.evaluate((element) => element.tagName, element);
}
