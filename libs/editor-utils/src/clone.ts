import { nanoid } from 'nanoid';
import { AnyElement, Text } from '@decipad/editor-types';
import { AnyObject, isText } from '@udecode/plate';
import { Draft } from 'immer';
import { Computer } from '@decipad/computer';
import { Element } from 'slate';
import { deduplicateVarNameInBlock } from './deduplicateVarNameInBlock';
import { isElement } from './isElement';
import { cloneDeep } from 'lodash';

type WithId = { id: string };

const hasId = (n: AnyObject): n is WithId => {
  return n != null && 'id' in n && typeof n.id === 'string';
};

function deduplicateId<T extends Draft<Element & WithId>>(el: T): T {
  if (hasId(el)) {
    // eslint-disable-next-line no-param-reassign
    el.id = nanoid();
  }
  return el;
}

export function clone<T extends AnyElement | Text>(
  computer: Computer,
  el: T
): T {
  if (isText(el)) {
    return el;
  }
  if (isElement(el)) {
    let clonedEl = cloneDeep(el);
    clonedEl.children = deduplicateVarNameInBlock(
      computer,
      deduplicateId(clonedEl)
    ).children;
    if (Array.isArray(clonedEl.children)) {
      const children = new Array(clonedEl.children.length);
      let i = -1;
      for (const c of clonedEl.children) {
        i += 1;
        children[i] = clone(computer, c);
      }
      clonedEl.children = children;
    }
    return clonedEl;
  }

  return el;
}
