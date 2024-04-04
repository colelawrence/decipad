import invariant from 'tiny-invariant';
import type { MyElement } from '@decipad/editor-types';
import type { TInsertNodeOperation } from '@udecode/plate-common';
import type { SharedType } from '../../model';
import { SyncNode } from '../../model';
import { getParent } from '../../path';
import { toSyncElement } from '../../utils/convert';

/**
 * Applies an insert node operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function insertNode(
  doc: SharedType,
  op: TInsertNodeOperation
): SharedType {
  const [parent, index] = getParent(doc, op.path);

  const children = SyncNode.getChildren(parent);
  if (SyncNode.getText(parent) !== undefined || !children) {
    throw new TypeError("Can't insert node into text node");
  }

  invariant(children, 'cannot apply insert node operation to text node');

  children.insert(index, [toSyncElement(op.node as MyElement)]);
  return doc;
}
