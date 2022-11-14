/* eslint-disable no-underscore-dangle */
/* eslint-disable no-prototype-builtins */
import {
  DrawElement,
  DrawElementDescendant,
  ELEMENT_FREEDRAW,
  MyEditor,
} from '@decipad/editor-types';
import {
  deleteText,
  insertNodes,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { dequal } from 'dequal';
import { nanoid } from 'nanoid';
import { NodeEntry } from 'slate';
import invariant from 'tiny-invariant';
import { fixElement } from './fixElement';

const removeRemoved = (
  editor: MyEditor,
  parent: NodeEntry<DrawElement>,
  elementsBefore: Readonly<Array<DrawElementDescendant>>,
  elementsAfter: Readonly<Array<DrawElementDescendant>>
): boolean => {
  let hasAdditions = false;
  let elIndex = elementsBefore.length;
  const childrenCountBefore = elementsBefore.length;
  let childrenCountAfter = childrenCountBefore;
  for (const elBefore of [...elementsBefore].reverse()) {
    elIndex -= 1;
    if (elBefore.__dummy) {
      // dummy node that should not be removed
      // to prevent slate from ruining this parent block
      continue;
    }
    const foundElement = elementsAfter.find((el) => el.id === elBefore.id);
    const deleted = !foundElement || foundElement.isDeleted;
    if (deleted) {
      const path = [...parent[1], elIndex];
      deleteText(editor, { at: path, unit: 'block', voids: true });
      hasAdditions = true;
      childrenCountAfter -= 1;
    }
  }
  // if we removed all children we need to add a child otherwise slate
  // will mess up our block
  if (childrenCountAfter === 0) {
    const dummyElement: DrawElementDescendant = {
      type: ELEMENT_FREEDRAW,
      id: nanoid(),
      points: [],
      pressures: [],
      __dummy: true,
      children: [{ text: '' }],
    };
    insertNodes(editor, [dummyElement], { at: [...parent[1], 0] });
  }
  return hasAdditions;
};

const addAdded = (
  editor: MyEditor,
  parent: NodeEntry<DrawElement>,
  elementsBefore: Readonly<Array<DrawElementDescendant>>,
  elementsAfter: Readonly<Array<DrawElementDescendant>>
): boolean => {
  let hasAdditions = false;
  for (const elAfter of elementsAfter) {
    if (
      !elAfter.isDeleted &&
      !elementsBefore.find((el) => el.id === elAfter.id)
    ) {
      const newElementPath = [...parent[1], parent[0].children.length];
      insertNodes(editor, [fixElement(elAfter)], { at: newElementPath });
      hasAdditions = true;
    }
  }
  return hasAdditions;
};

const diffElements = (
  elementBefore: DrawElementDescendant,
  elementAfter: DrawElementDescendant
): Partial<DrawElementDescendant> => {
  if (
    elementBefore.version != null &&
    elementAfter.version != null &&
    elementBefore.version > elementAfter.version
  ) {
    return {};
  }
  const diff: Partial<DrawElementDescendant> = {};
  invariant(
    elementAfter.id === elementBefore.id,
    'expected both elements to have the same id'
  );
  // get modified props
  for (const [key, value] of Object.entries(elementBefore)) {
    const valueAfter = elementAfter[key as keyof typeof elementAfter];
    if (!dequal(value, valueAfter)) {
      diff[key] = valueAfter;
    }
  }

  // get new props
  for (const [key, value] of Object.entries(elementAfter)) {
    if (!elementBefore.hasOwnProperty(key)) {
      diff[key as keyof DrawElementDescendant] = value;
    }
  }

  return diff;
};

const modifyModified = (
  editor: MyEditor,
  parent: NodeEntry<DrawElement>,
  elementsBefore: Readonly<Array<DrawElementDescendant>>,
  elementsAfter: Readonly<Array<DrawElementDescendant>>
): boolean => {
  let hasModifications = false;
  let beforeIndex = -1;
  for (const elBefore of elementsBefore) {
    beforeIndex += 1;
    if (elBefore.__dummy) {
      continue;
    }
    const elAfter = elementsAfter.find((el) => el.id === elBefore.id);
    if (elAfter) {
      const diff = diffElements(elBefore, elAfter);
      if (Object.keys(diff).length === 0) {
        continue;
      }
      const path = [...parent[1], beforeIndex];
      setNodes(editor, fixElement(diff), { at: path, voids: true });
      hasModifications = true;
    }
  }
  return hasModifications;
};

export const applyElementsDiff = (
  editor: MyEditor,
  parent: NodeEntry<DrawElement>,
  elementsBefore: Readonly<Array<DrawElementDescendant>>,
  elementsAfter: Readonly<Array<DrawElementDescendant>>
): boolean => {
  let hasModifications = false;
  withoutNormalizing(editor, () => {
    hasModifications ||= modifyModified(
      editor,
      parent,
      elementsBefore,
      elementsAfter
    );
    hasModifications ||= addAdded(
      editor,
      parent,
      elementsBefore,
      elementsAfter
    );
    hasModifications ||= removeRemoved(
      editor,
      parent,
      elementsBefore,
      elementsAfter
    );
  });
  return hasModifications;
};
