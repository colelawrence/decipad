import { ElementHandle } from 'playwright';

export async function getTagName(element: ElementHandle): Promise<string> {
  return page.evaluate(({ tagName }) => tagName, element);
}
