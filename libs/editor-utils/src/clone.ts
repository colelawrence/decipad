/* eslint-disable no-param-reassign */
import cloneDeep from 'lodash.clonedeep';
import { isElement } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import type { MyElement, MyNode } from '@decipad/editor-types';
import type { Computer } from '@decipad/computer-interfaces';
import type { PromiseOrType } from '@decipad/utils';
import { identity } from '@decipad/utils';
import { deduplicateVarNameInBlock } from './deduplicateVarNameInBlock';

const recReplaceIds = <T extends MyNode>(el: T): T => {
  if (!isElement(el)) return el;

  // @ts-ignore
  el.id = nanoid();

  for (const child of el.children) {
    recReplaceIds(child);
  }

  return el;
};

const cloneAndReplaceElementIds = <T extends MyElement>(
  el: T,
  transform: (e: T) => PromiseOrType<T> = identity
): PromiseOrType<T> => {
  const clone = structuredClone(el);
  return transform(recReplaceIds(clone));
};

const cloneElement = <T extends MyElement>(
  computer: Computer,
  el: T
): PromiseOrType<T> =>
  cloneAndReplaceElementIds(el, (e) => deduplicateVarNameInBlock(computer, e));

export const clone = <T extends MyNode>(
  computer: Computer,
  node: T
): PromiseOrType<T> => {
  if (isElement(node)) {
    return cloneElement(computer, node) as T;
  }
  return cloneDeep(node);
};
