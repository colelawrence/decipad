import { isElement } from '@udecode/plate-common';
import type { Computer } from '@decipad/computer-interfaces';
import {
  type RootDocument,
  type TabElement,
  type ElementKind,
  type AnyElement,
  type LayoutElement,
  type MyNode,
  ELEMENT_SMART_REF,
  ELEMENT_LAYOUT,
  ELEMENT_TAB,
} from '../../editor-types/src';
import { getVerbalizer, getVarnameToId } from './verbalizers';
import { nodeStringVerbalizer } from './verbalizers/nodeStringVerbalizer';
import { getNodeString } from './utils/getNodeString';
import { verbalizeResult } from './verbalizeResult';

export interface VerbalizedElement {
  element: AnyElement;
  verbalized: string;
  tags: Set<string>;
  varName?: string;
  value?: string;
}

export interface DocumentVerbalization {
  document: RootDocument;
  verbalized: VerbalizedElement[];
}

const isStructuralElement = (
  element: AnyElement
): element is LayoutElement | TabElement =>
  element.type === ELEMENT_LAYOUT || element.type === ELEMENT_TAB; // right now, only columns are structural elements. Add tabs here later.

export const verbalizeElement = (
  element: AnyElement,
  computer: Computer,
  tags: Set<string> = new Set()
): VerbalizedElement[] => {
  if (isStructuralElement(element)) {
    return element.children.flatMap(
      (child) => verbalizeElement(child, computer, new Set()),
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

  const varnameMapper = getVarnameToId(element);

  if (!varnameMapper) {
    return [
      {
        element,
        verbalized,
        tags,
      },
    ];
  }

  const [varName] = varnameMapper(element);

  const result = computer.getBlockIdResult(element.blockId as string);
  const value = result != null ? verbalizeResult(result) : undefined;

  return [
    {
      element,
      verbalized,
      tags,
      varName,
      value,
    },
  ];
};

export const verbalizeDoc = (
  doc: RootDocument,
  computer: Computer,
  filterElementTypes?: Set<ElementKind>
): DocumentVerbalization => {
  const verbalizedObject = {
    document: doc,
    verbalized: doc.children.flatMap((child) =>
      verbalizeElement(child, computer, new Set())
    ),
  };

  if (filterElementTypes == null) {
    return verbalizedObject;
  }

  filterElementTypes.add('columns');
  filterElementTypes.add('tab');

  return {
    ...verbalizedObject,
    verbalized: verbalizedObject.verbalized.filter((el) =>
      filterElementTypes.has(el.element.type)
    ),
  };
};
