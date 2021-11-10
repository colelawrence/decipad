import { ElementHandle } from 'playwright';

export async function getTagName(
  element: ElementHandle,
  $page = page
): Promise<string> {
  return $page.evaluate(({ tagName }) => tagName, element);
}
