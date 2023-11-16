import { TOperation } from '@udecode/plate';
import cloneDeep from 'lodash.clonedeep';
import { Path } from 'slate';

/**
 * Take a sub editor operation, and add tabIndex to it to create a
 * global operation docsync can use.
 */
export function TranslateOpUp(tabIndex: number, _op: TOperation): TOperation {
  if (tabIndex < 0) {
    throw new Error('You should only provide index values');
  }

  const op = cloneDeep(_op);
  if (op.type === 'set_selection') {
    op.properties?.focus?.path.unshift(tabIndex);
    op.properties?.anchor?.path.unshift(tabIndex);

    op.newProperties?.focus?.path.unshift(tabIndex);
    op.newProperties?.anchor?.path.unshift(tabIndex);

    return op;
  }

  op.path.unshift(tabIndex);

  if (op.type === 'move_node') {
    op.newPath.unshift(tabIndex);
  }

  return op;
}

/**
 * Take a docsync operation, and return which sub editor it should
 * be applied to, as well as the operation translated
 */
export function TranslateOpDown(_op: TOperation): [number, TOperation] {
  const op = cloneDeep(_op);
  if (op.type === 'set_selection') {
    const tabIndex = op.properties?.focus?.path.shift();
    if (tabIndex == null) throw new Error('Path length cannot be 0');

    op.properties?.anchor?.path.shift();

    op.newProperties?.focus?.path.shift();
    op.newProperties?.anchor?.path.shift();

    return [tabIndex, op];
  }

  const tabIndex = op.path.shift();
  if (tabIndex == null) throw new Error('Path length cannot be 0');

  if (op.type === 'move_node') {
    op.newPath.shift();
  }

  return [tabIndex, op];
}

export function TranslatePathUp(tabIndex: number, _path: Path): Path {
  const path = cloneDeep(_path);
  path.unshift(tabIndex);
  return path;
}

export function TranslatePathDown(_path: Path): [number, Path] {
  const path = cloneDeep(_path);
  if (path.length === 0) {
    throw new Error('Path should have at least one element');
  }

  const tab = path.shift();
  return [tab!, path];
}
