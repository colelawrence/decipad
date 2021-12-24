import { ElementHandle } from 'playwright';

export async function getTagName(
  element: ElementHandle<Element>,
  $page = page
): Promise<string> {
  return $page.evaluate(({ tagName }) => tagName, element);
}
