import { isElement } from '@udecode/plate-common';
import {
  type AnyElement,
  type ColumnsElement,
  type MyNode,
  ELEMENT_SMART_REF,
  ELEMENT_COLUMNS,
  ELEMENT_TAB,
  RootDocument,
  TabElement,
} from '../../editor-types/src';
import { getVerbalizer } from './verbalizers';
import { nodeStringVerbalizer } from './verbalizers/nodeStringVerbalizer';
import { getNodeString } from './utils/getNodeString';

export interface VerbalizedElement {
  element: AnyElement;
  verbalized: string;
  tags: Set<string>;
}

export interface DocumentVerbalization {
  document: RootDocument;
  verbalized: VerbalizedElement[];
}

const isStructuralElement = (
  element: AnyElement
): element is ColumnsElement | TabElement =>
  element.type === ELEMENT_COLUMNS || element.type === ELEMENT_TAB; // right now, only columns are structural elements. Add tabs here later.

export const verbalizeElement = (
  element: AnyElement,
  tags: Set<string> = new Set()
): VerbalizedElement[] => {
  if (isStructuralElement(element)) {
    return element.children.flatMap(
      (child) => verbalizeElement(child, new Set()),
      tags
    );
  }
  const verbalizeOneNode = (node: MyNode): string => {
    if (isElement(node)) {
      tags.add(node.type);
      if (node.type === ELEMENT_SMART_REF) {
        return (node.lastSeenVariableName ?? getNodeString(node)) as string;
      }
      const v = getVerbalizer(node as AnyElement);
      const result =
        v != null
          ? v(node as AnyElement, verbalizeOneNode)
          : node.children.map(verbalizeOneNode).join('');
      return result;
    }
    const result = getNodeString(node);
    return result;
  };
  const v = getVerbalizer(element as AnyElement);
  let verbalized: string;
  if (v == null) {
    tags.add(element.type);
    verbalized = nodeStringVerbalizer(element, verbalizeOneNode);
  } else {
    verbalized = v(element, verbalizeOneNode);
  }

  return [
    {
      element,
      verbalized,
      tags,
    },
  ];
};

export const verbalizeDoc = (doc: RootDocument): DocumentVerbalization => {
  return {
    document: doc,
    verbalized: doc.children.flatMap((child) =>
      verbalizeElement(child, new Set())
    ),
  };
};
