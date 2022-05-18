import { getDefined } from '@decipad/utils';
import { TRemoveTextOperation } from '@udecode/plate';
import { SharedType, SyncElement } from '../../model';
import { getTarget } from '../../path';

/**
 * Applies a remove text operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function removeText(
  doc: SharedType,
  op: TRemoveTextOperation
): SharedType {
  const node = getTarget(doc, op.path) as SyncElement;
  const nodeText = getDefined(
    SyncElement.getText(node),
    'could not find text in node'
  );
  nodeText.delete(op.offset, op.text.length);
  return doc;
}
