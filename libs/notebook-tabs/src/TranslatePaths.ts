import type { TOperation } from '@udecode/plate-common';
import cloneDeep from 'lodash/cloneDeep';
import type { Path } from 'slate';
import { debug } from './debug';
import stringify from 'json-stringify-safe';
import { getDefined } from '@decipad/utils';

/**
 * Take a sub editor operation, and add tabIndex to it to create a
 * global operation docsync can use.
 */
export function translateOpUp(tabIndex: number, _op: TOperation): TOperation {
  if (tabIndex < 0) {
    throw new Error('You should only provide index values');
  }

  const op = cloneDeep(_op);
  if (op.type === 'set_selection') {
    op.properties?.focus?.path.unshift(tabIndex);

    if (op.properties?.focus?.path !== op.properties?.anchor?.path) {
      op.properties?.anchor?.path.unshift(tabIndex);
    }

    op.newProperties?.focus?.path.unshift(tabIndex);

    if (op.newProperties?.focus?.path !== op.newProperties?.anchor?.path) {
      op.newProperties?.anchor?.path.unshift(tabIndex);
    }

    return op;
  }

  op.path.unshift(tabIndex);

  if (op.type === 'move_node') {
    op.newPath.unshift(tabIndex);
  }

  return op;
}

export const childIndexForOp = (op: TOperation): number | undefined => {
  if (op.type === 'set_selection') {
    return (
      op.newProperties?.focus?.path[0] ??
      op.newProperties?.anchor?.path[0] ??
      op.properties?.focus?.path[0] ??
      op.properties?.anchor?.path[0]
    );
  }
  return op.path[0];
};

export type OpDownTranslator = <T extends TOperation>(op: T) => [number, T];

/**
 * Take a docsync operation, and return which sub editor it should
 * be applied to, as well as the operation translated
 */
export const translateOpDown: OpDownTranslator = <T extends TOperation>(
  _op: T
): [number, T] => {
  const op = cloneDeep(_op);
  if (op.type === 'set_selection') {
    const tabIndex = childIndexForOp(op);
    if (tabIndex == null) {
      debug('translateOpDown op', stringify(op, null, '\t'));
      throw new Error('Path length cannot be 0');
    }

    op.properties?.focus?.path.shift();

    if (op.properties?.focus?.path !== op.properties?.anchor?.path) {
      op.properties?.anchor?.path.shift();
    }

    op.newProperties?.focus?.path.shift();

    if (op.newProperties?.focus?.path !== op.newProperties?.anchor?.path) {
      op.newProperties?.anchor?.path.shift();
    }

    return [tabIndex, op];
  }

  const tabIndex = op.path.shift();
  if (tabIndex == null) throw new Error('Path length cannot be 0');

  if (op.type === 'move_node') {
    const destinationPath = getDefined(op.newPath.shift());
    return [destinationPath, op];
  }

  return [tabIndex, op];
};

export function translatePathUp(tabIndex: number, _path: Path): Path {
  const path = cloneDeep(_path);
  path.unshift(tabIndex);
  return path;
}

export function translatePathDown(_path: Path): [number, Path] {
  const path = cloneDeep(_path);
  if (path.length === 0) {
    throw new Error('Path should have at least one element');
  }

  const tab = path.shift();
  return [tab!, path];
}
