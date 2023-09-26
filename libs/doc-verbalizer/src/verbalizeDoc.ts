import { getNodeString } from '@udecode/plate';
import type {
  Document,
  AnyElement,
  ColumnsElement,
} from '@decipad/editor-types';
import { getVerbalizer } from './verbalizers';

interface VerbalizedElement {
  element: AnyElement;
  verbalized: string;
}

interface DocumentVerbalization {
  document: Document;
  verbalized: VerbalizedElement[];
}

const isStructuralElement = (element: AnyElement): element is ColumnsElement =>
  element.type === 'columns'; // right now, only columns are structural elements. Add tabs here later.

const verbalizeElement = (element: AnyElement): VerbalizedElement[] => {
  const v = getVerbalizer(element);
  if (isStructuralElement(element)) {
    return element.children.flatMap(verbalizeElement);
  }
  return [
    {
      element,
      verbalized: v != null ? v(element) : getNodeString(element),
    },
  ];
};

export const verbalizeDoc = (doc: Document): DocumentVerbalization => {
  return {
    document: doc,
    verbalized: doc.children.flatMap(verbalizeElement),
  };
};
