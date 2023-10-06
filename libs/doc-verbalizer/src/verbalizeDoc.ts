import { getNodeString, isElement } from '@udecode/plate';
import {
  type Document,
  type AnyElement,
  type ColumnsElement,
  type MyNode,
  ELEMENT_SMART_REF,
} from '../../editor-types/src';
import { getVerbalizer } from './verbalizers';

export interface VerbalizedElement {
  element: AnyElement;
  verbalized: string;
}

export interface DocumentVerbalization {
  document: Document;
  verbalized: VerbalizedElement[];
}

const isStructuralElement = (element: AnyElement): element is ColumnsElement =>
  element.type === 'columns'; // right now, only columns are structural elements. Add tabs here later.

const verbalizeOneNode = (node: MyNode): string => {
  if (isElement(node)) {
    if (node.type === ELEMENT_SMART_REF) {
      return node.lastSeenVariableName ?? getNodeString(node);
    }
    const v = getVerbalizer(node);
    const result =
      v != null
        ? v(node, verbalizeOneNode)
        : node.children.map(verbalizeOneNode).join('');
    return result;
  }
  const result = getNodeString(node);
  return result;
};

const verbalizeElement = (element: AnyElement): VerbalizedElement[] => {
  const v = getVerbalizer(element);
  if (isStructuralElement(element)) {
    return element.children.flatMap(verbalizeElement);
  }
  return [
    {
      element,
      verbalized:
        v != null ? v(element, verbalizeOneNode) : verbalizeOneNode(element),
    },
  ];
};

export const verbalizeDoc = (doc: Document): DocumentVerbalization => {
  return {
    document: doc,
    verbalized: doc.children.flatMap(verbalizeElement),
  };
};
