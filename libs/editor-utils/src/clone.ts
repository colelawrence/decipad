/* eslint-disable no-param-reassign */
import cloneDeep from 'lodash.clonedeep';
import { isElement } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { MyElement, MyNode } from '@decipad/editor-types';
import { RemoteComputer } from '@decipad/remote-computer';
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
  transform: (e: T) => T = identity
): T => {
  const clone = structuredClone(el);
  return transform(recReplaceIds(clone));
};

const cloneElement = <T extends MyElement>(
  computer: RemoteComputer,
  el: T
): T =>
  cloneAndReplaceElementIds(el, (e) => deduplicateVarNameInBlock(computer, e));

export const clone = <T extends MyNode>(
  computer: RemoteComputer,
  node: T
): T => {
  if (isElement(node)) {
    return cloneElement(computer, node) as T;
  }
  return cloneDeep(node);
};
