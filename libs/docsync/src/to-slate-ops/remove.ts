import { Diff, Doc } from 'automerge';
import { Element } from 'slate';
import { toSlatePath } from '../utils/to-slate-path';
import { getTarget } from '../utils/path';
import assert from 'assert';

const removeTextOp = (op: Diff) => (map: any, doc: Element) => {
  const { index, path, obj } = op;

  const slatePath = toSlatePath(path).slice(0, path && path.length);

  let node = map[obj];

  node = getTarget(doc, slatePath);

  if (typeof index !== 'number') return;

  const text = (node && node.text && node.text[index]) || '*';

  if (node) {
    node.text = node.text
      ? (node.text.slice(0, index) as string) +
        (node.text.slice(index + 1) as string)
      : '';
  }

  return {
    type: 'remove_text',
    path: slatePath,
    offset: index,
    text,
    marks: [],
  };
};

const removeAttributeOp =
  (op: Diff, before: Doc<{ value: SyncDocDoc }>) =>
  (map: any, doc: Element) => {
    const { obj, path, key } = op;

    const slatePath = toSlatePath(path);

    const target = getTarget(doc, slatePath);

    assert(target, 'Target is not found!');

    if (!Object.prototype.hasOwnProperty.call(map, obj)) {
      map[obj] = target;
    }

    return {
      type: 'set_node',
      path: slatePath,
      properties: {
        [key as string]: (before as any)[key as string] as any,
      } as any,
      newProperties: { [key as string]: undefined },
    };
  };

const removeNodeOp = (op: Diff) => (map: any, doc: Element) => {
  const { index, obj, path } = op;

  const slatePath = toSlatePath(path);

  const parent = getTarget(doc, slatePath);
  const target = (parent &&
    parent.children &&
    parent.children[index as number]) ||
    (parent && parent[index as number]) || { children: [] };

  assert(target, 'Target is not found!');

  if (!Object.prototype.hasOwnProperty.call(map, obj)) {
    map[obj] = target;
  }

  assert(Number.isInteger(index), 'Index is not a number');

  return {
    type: 'remove_node',
    path: slatePath.length ? slatePath.concat(index) : [index],
    node: target,
  };
};

const opRemove = (
  op: Diff,
  [map, ops]: any,
  _: Doc<{ value: SyncDocDoc }>,
  before: Doc<{ value: SyncDocDoc }>
) => {
  const { index, path, obj, type } = op;

  if (
    Object.prototype.hasOwnProperty.call(map, obj) &&
    typeof map[obj] !== 'string' &&
    type !== 'text' &&
    map &&
    map.obj &&
    map.obj.length
  ) {
    map[obj].splice(index, 1);

    return [map, ops];
  }

  if (!path) return [map, ops];

  const key = path[path.length - 1];

  if (key === 'cursors' || op.key === 'cursors') return [map, ops];

  const fn =
    key === 'text'
      ? removeTextOp
      : type === 'map'
      ? removeAttributeOp
      : removeNodeOp;

  return [map, [...ops, fn(op, before)]];
};

export { opRemove };
