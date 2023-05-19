/* eslint-disable no-underscore-dangle */
/* eslint-disable no-prototype-builtins */
import { DrawElementDescendant } from '@decipad/editor-types';
import { dequal } from '@decipad/utils';
import invariant from 'tiny-invariant';
import { DrawElementsDiff } from './types';

const findRemoved = (
  elementsBefore: Readonly<Array<DrawElementDescendant>>,
  elementsAfter: Readonly<Array<DrawElementDescendant>>
): DrawElementsDiff['removed'] => {
  const deletedIds: string[] = [];
  for (const elBefore of [...elementsBefore].reverse()) {
    if (elBefore.__dummy) {
      // dummy node that should not be removed
      // to prevent slate from ruining this parent block
      continue;
    }
    const foundElement = elementsAfter.find((el) => el.id === elBefore.id);
    const deleted = !foundElement || foundElement.isDeleted;
    if (deleted) {
      deletedIds.push(elBefore.id);
    }
  }
  return deletedIds;
};

const findAdded = (
  elementsBefore: Readonly<Array<DrawElementDescendant>>,
  elementsAfter: Readonly<Array<DrawElementDescendant>>
): DrawElementsDiff['added'] => {
  const added: Array<DrawElementDescendant> = [];
  for (const elAfter of elementsAfter) {
    if (
      !elAfter.isDeleted &&
      !elementsBefore.find((el) => el.id === elAfter.id)
    ) {
      added.push(elAfter);
    }
  }
  return added;
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

const findModified = (
  elementsBefore: Readonly<Array<DrawElementDescendant>>,
  elementsAfter: Readonly<Array<DrawElementDescendant>>
): DrawElementsDiff['modified'] => {
  const modified: Array<Partial<DrawElementDescendant> & { id: string }> = [];
  for (const elBefore of elementsBefore) {
    if (elBefore.__dummy) {
      continue;
    }
    const elAfter = elementsAfter.find((el) => el.id === elBefore.id);
    if (elAfter) {
      const diff = diffElements(elBefore, elAfter);
      if (Object.keys(diff).length === 0) {
        continue;
      }
      modified.push({ ...diff, id: elBefore.id });
    }
  }
  return modified;
};

export const findElementsDiff = (
  elementsBefore: Readonly<Array<DrawElementDescendant>>,
  elementsAfter: Readonly<Array<DrawElementDescendant>>
): DrawElementsDiff => {
  return {
    added: findAdded(elementsBefore, elementsAfter),
    removed: findRemoved(elementsBefore, elementsAfter),
    modified: findModified(elementsBefore, elementsAfter),
  };
};
