import stringify from 'json-stringify-safe';
import cloneDeep from 'lodash.clonedeep';
import { isElement } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { MyElement, MyNode } from '@decipad/editor-types';
import { RemoteComputer } from '@decipad/remote-computer';
import { identity } from '@decipad/utils';
import { deduplicateVarNameInBlock } from './deduplicateVarNameInBlock';

const traverseElements = <T extends MyElement>(
  el: T,
  t: (e: MyElement) => void
) => {
  t(el);
  for (const child of el.children) {
    if (isElement(child)) {
      traverseElements(child, t);
    }
  }
};

const cloneAndReplaceElementIds = <T extends MyElement>(
  el: T,
  transform: (e: T) => T = identity
): T => {
  let text = stringify(el);
  traverseElements(el, (e) => {
    if (e.id) {
      text = text.replaceAll(e.id, nanoid());
    }
  });
  return transform(JSON.parse(text));
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
