/* eslint-disable no-underscore-dangle */
import { DrawElementDescendant, DrawElements } from '@decipad/editor-types';
import { ExcalidrawDrawElement } from './types';

const notDeleted = (element: DrawElementDescendant): boolean =>
  !element.isDeleted;

// undoes Slate fixes (converts elements back to Excalidraw form)
const unfixElement = (
  element: Partial<DrawElementDescendant>
): ExcalidrawDrawElement => {
  // eslint-disable-next-line no-prototype-builtins
  if (element.hasOwnProperty('__text')) {
    const { __text: text, ...rest } = element;
    return {
      ...rest,
      text,
    };
  }
  return element;
};

export const unfixElements = (
  elements: Readonly<DrawElements>
): ExcalidrawDrawElement[] => {
  return elements.filter(notDeleted).map(unfixElement);
};

// fixes element for slate
export const fixElement = (
  _elem: Readonly<Partial<ExcalidrawDrawElement>>
): DrawElementDescendant => {
  let elem = _elem;
  // eslint-disable-next-line no-prototype-builtins
  if (elem.hasOwnProperty('text')) {
    const { text, ...rest } = elem;
    elem = {
      ...rest,
      __text: text as string,
    };
  }
  if (!Array.isArray(elem.children)) {
    elem = {
      ...elem,
      children: [{ text: '' }],
    };
  }
  return elem as DrawElementDescendant;
};

// fixes elements from Excalidraw form to Slate
export const fixElements = (
  elements: Readonly<Partial<ExcalidrawDrawElement>[]>
): Readonly<DrawElementDescendant[]> => elements.map(fixElement);
