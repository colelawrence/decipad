import { AnyElement } from '@decipad/editor-types';

/** Get the (unstable) ID for a magic number. */
export const magicNumberId = (
  element: AnyElement,
  childIndex: number
): string => {
  return `${element.id}-${childIndex}`;
};
