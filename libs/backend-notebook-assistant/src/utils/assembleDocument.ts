import type { Document, MyElement, MyValue } from '@decipad/editor-types';
import cloneDeep from 'lodash.clonedeep';

export const assembleDocument = (
  original: Document,
  elements: Array<MyElement>
): Document => {
  const newDocument = cloneDeep(original);

  for (const element of elements) {
    const changedElementIndex = newDocument.children.findIndex(
      (el) => el.id === element.id
    );
    if (changedElementIndex >= 0) {
      newDocument.children[changedElementIndex] = element as MyValue[number];
    } else {
      newDocument.children.push(element as MyValue[number]);
    }
  }
  return newDocument;
};
