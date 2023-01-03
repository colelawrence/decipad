import { nanoid } from 'nanoid';
import { AnyElement, Text } from '@decipad/editor-types';
import { AnyObject, isText } from '@udecode/plate';
import { Computer } from '@decipad/computer';
import { cloneDeep } from 'lodash';
import { deduplicateVarNameInBlock } from './deduplicateVarNameInBlock';
import { isElement } from './isElement';

type WithId = { id: string };

const hasId = (n: AnyObject): n is WithId => {
  return n != null && 'id' in n && typeof n.id === 'string';
};

const deduplicateId = <T extends AnyElement>(el: T): T => {
  if (hasId(el)) {
    // eslint-disable-next-line no-param-reassign
    el.id = nanoid();
  }
  return el;
};

type Clone = <T extends AnyElement | Text>(el: T) => T;

export const clone = (computer: Computer): Clone => {
  const deduplicateVarName = deduplicateVarNameInBlock(computer);
  const cloneEl = <T extends AnyElement | Text>(el: T): T => {
    if (isText(el)) {
      return cloneDeep(el);
    }
    if (isElement(el)) {
      return {
        ...deduplicateVarName(deduplicateId(cloneDeep(el))),
        children: Array.isArray(el.children)
          ? el.children.map(cloneEl)
          : el.children,
      };
    }

    return el;
  };

  return cloneEl;
};
