/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Image, Root } from 'mdast';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit, CONTINUE, EXIT } from 'unist-util-visit';

interface TrailingImage {
  readonly startOffset: number;
  readonly url: string;
  readonly alt?: string;
}

export const getTrailingImage = (
  textPotentiallyEndingWithImage: string
): TrailingImage | null => {
  let result: TrailingImage | null = null;

  const root = unified()
    .use(remarkParse)
    .parse(textPotentiallyEndingWithImage) as Root;
  visit<Image, 'image'>(
    root as Parameters<typeof visit>[0],
    'image',
    (image) => {
      if (image.type !== 'image') {
        return CONTINUE;
      }
      const startOffset = image.position!.start.offset!;
      const endOffset = image.position!.end.offset!;

      if (
        image.type !== 'image' ||
        endOffset !== textPotentiallyEndingWithImage.length
      ) {
        return CONTINUE;
      }

      result = {
        startOffset,
        url: image.url,
        alt: image.alt || undefined,
      };
      return EXIT;
    }
  );

  return result;
};
