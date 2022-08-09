import { MyElement } from '@decipad/editor-types';

/** Get the (unstable) ID for a magic number. */
export const magicNumberId = (
  element: MyElement,
  childIndex: number
): string => {
  return `${element.id}-${childIndex}`;
};
