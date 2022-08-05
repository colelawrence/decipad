import { ParagraphElement } from '@decipad/editor-types';

/** Get the (unstable) ID for a magic number. */
export const magicNumberId = (
  paragraph: ParagraphElement,
  childIndex: number
): string => {
  return `${paragraph.id}-${childIndex}`;
};
