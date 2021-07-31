import { getParent, getChildren } from '../utils/path';
import { toJS } from '../utils/to-js';
import { cloneNode } from '../utils/clone-node';
import { ExtendedSlateMergeNodeOperation, SyncValue, SyncNode } from '../types';

export function mergeNode(
  doc: SyncValue,
  op: ExtendedSlateMergeNodeOperation
): SyncValue {
  const [parent, index]: [any, number] = getParent(doc, op.path) as [
    any,
    number
  ];

  const prev = parent[index - 1] || parent.children[index - 1];
  const next = parent[index] || parent.children[index];

  if (prev.text) {
    prev.text.insertAt(prev.text.length, ...toJS(next.text).split(''));
  } else {
    getChildren(next).forEach((n: SyncNode) =>
      getChildren(prev).push(cloneNode(n))
    );
  }

  getChildren(parent).deleteAt(index, 1);

  return doc;
}
