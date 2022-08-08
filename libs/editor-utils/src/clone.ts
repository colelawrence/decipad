import { nanoid } from 'nanoid';
import { AnyElement, Text } from '@decipad/editor-types';
import { AnyObject, isText } from '@udecode/plate';
import produce, { Draft } from 'immer';
import { Computer } from '@decipad/computer';
import { Element } from 'slate';
import { deduplicateVarNameInBlock } from './deduplicateVarNameInBlock';
import { isElement } from './isElement';

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
    return produce(el, (e) => {
      deduplicateVarNameInBlock(computer, deduplicateId(e));
      if (Array.isArray(e.children)) {
        const children = new Array(e.children.length);
        let i = -1;
        for (const c of e.children) {
          i += 1;
          children[i] = clone(computer, c);
        }
        e.children = children;
      }
    });
  }

  return el;
}
