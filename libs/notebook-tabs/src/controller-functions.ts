/* eslint-disable no-param-reassign */
import { TEditor, TMoveNodeOperation } from '@udecode/plate-common';

/**
 * This function applies the move operation to the mirror editor
 * as if it's coming from the root, this means it won't trickle down
 * further.
 *
 * Another part is the `FROM_MIRROR` mutation to the actual operation,
 * this is because we don't want to apply this function further down the line.
 *
 * The only reason we are applying it early here, is because of the but where
 * the WeakMap `NORMALIZING` in the slate code, seems to get reset and doesn't allow us
 * to delay normalizion.
 *
 * This bug was tracked by John and Alan, and the best explanation is to do with loading
 * mulitple version of Slate, hence initializing different versions of the WeakMap.
 *
 */
export function applyToMirrorAsRoot<T extends TEditor>(
  op: TMoveNodeOperation,
  editor: T
): void {
  editor.apply({
    ...op,
    FROM_ROOT: true,
  });

  op.FROM_MIRROR = true;
}
