import unified from 'unified';
import type { Link, Root } from 'mdast';
import visit from 'unist-util-visit';
import remarkParse from 'remark-parse';

interface TrailingLink {
  readonly startOffset: number;
  readonly url: string;
  readonly text: string;
}
/**
 * Try to find a markdown link at the very end of given text.
 * @returns `null`, **if** given text does not end with a markdown link.
 * @returns The `startOffset` of the link in the text and its parsed URL portion and text portion (without parsing any nested markdown), **otherwise**.
 */
export const getTrailingLink = (
  textPotentiallyEndingWithLink: string
): TrailingLink | null => {
  let result: TrailingLink | null = null;

  const root = unified()
    .use(remarkParse)
    .parse(textPotentiallyEndingWithLink) as Root;
  visit<Link>(root, 'link', (link) => {
    // All nodes come from the parser (not programmatically added) and thus have a position
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const startOffset = link.position!.start.offset!;
    const endOffset = link.position!.end.offset!;
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    if (endOffset !== textPotentiallyEndingWithLink.length) {
      // Not a link that ends
      return visit.CONTINUE;
    }

    const textStartOffset = link.children[0]?.position?.start.offset ?? 1;
    const textEndOffset = link.children.slice(-1)[0]?.position?.end.offset ?? 1;

    result = {
      startOffset,
      url: link.url,
      text: textPotentiallyEndingWithLink.substring(
        textStartOffset,
        textEndOffset
      ),
    };
    return visit.EXIT;
  });

  return result;
};
