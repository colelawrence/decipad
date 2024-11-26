import {
  AnyElement,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { assert } from '@decipad/utils';
import {
  TEditor,
  TNodeEntry,
  TOperation,
  isElement,
} from '@udecode/plate-common';
import { nanoid } from 'nanoid';

type ElementKindToElementGenerator<T extends AnyElement = AnyElement> = {
  [K in T['type']]: T extends { type: K } ? () => T : never;
};

type ElementKindToElement<T extends AnyElement = AnyElement> = {
  [K in T['type']]: T extends { type: K } ? T : never;
};

export const elementKindsToDefaultsGenerator: Partial<ElementKindToElementGenerator> =
  {
    [ELEMENT_DATA_TAB_CHILDREN]: () => {
      return {
        id: nanoid(),
        type: ELEMENT_DATA_TAB_CHILDREN,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: '' }],
          },
          {
            id: nanoid(),
            type: ELEMENT_CODE_LINE_V2_CODE,
            children: [{ text: '' }],
          },
        ],
      };
    },
  };

export const elementKindsToDefaults: Partial<ElementKindToElement> =
  Object.fromEntries(
    Object.entries(elementKindsToDefaultsGenerator).map(([type, element]) => [
      type,
      element(),
    ])
  );

export const normalizeElement = <T extends AnyElement>(
  type: T['type']
): ((entry: TNodeEntry) => TOperation | undefined) => {
  const defaultElement = elementKindsToDefaults[type];
  if (defaultElement == null) {
    return () => {
      return undefined;
    };
  }

  return ([node, path]) => {
    if (!isElement(node)) {
      return undefined;
    }

    let i = 0;
    for (
      i = 0;
      i < node.children.length && i < defaultElement.children.length;
      i++
    ) {
      const currentNodeChild = node.children[i];
      const defaultNodeChild = defaultElement.children[i];

      assert(isElement(currentNodeChild) && isElement(defaultNodeChild));

      if (currentNodeChild.type === defaultNodeChild.type) {
        continue;
      }

      //
      // Our nodes are incorrect
      // Let's first look to see if it just got shifted along somehow.
      //

      const correctNodeIndex = node.children.findIndex(
        (c) => isElement(c) && c.type === defaultNodeChild.type
      );

      if (correctNodeIndex === -1) {
        // We can't find the node that is suppost to be in this posisition.
        // Let's insert a clean one.

        return {
          type: 'insert_node',
          path: [...path, i],
          node: elementKindsToDefaultsGenerator[type]!().children[i],
        };
      }

      return {
        type: 'move_node',
        path: [...path, correctNodeIndex],
        newPath: [...path, i],
      };
    }

    if (i < defaultElement.children.length) {
      return {
        type: 'insert_node',
        path: [...path, i],
        node: elementKindsToDefaultsGenerator[type]!().children[i],
      };
    }

    if (i < node.children.length) {
      return {
        type: 'remove_node',
        path: [...path, i],
        node: node.children[i],
      };
    }

    return undefined;
  };
};

export const createNormalizer = <
  T extends AnyElement = AnyElement,
  K extends TEditor = TEditor
>(
  type: T['type']
) => {
  const normalizer = normalizeElement(type);

  return (editor: K) => (entry: TNodeEntry) => {
    const [node] = entry;

    if (!isElement(node) || node.type !== type) {
      return false;
    }

    const operation = normalizer(entry);

    if (operation == null) {
      return false;
    }

    editor.apply(operation);
    return true;
  };
};
