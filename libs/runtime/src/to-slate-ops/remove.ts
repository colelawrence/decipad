import { Diff } from 'automerge';
import { Element } from 'slate';
import { toSlatePath } from '../utils/to-slate-path';
import { toJS } from '../utils/to-js';
import { getTarget } from '../utils/path';

const removeTextOp = (op: Diff) => (map: any, doc: Element) => {
  const { index, path, obj } = op;

  const slatePath = toSlatePath(path).slice(0, path && path.length);

  let node = map[obj];

  try {
    node = getTarget(doc, slatePath);
  } catch (e) {
    console.error(e, slatePath, op, map, toJS(doc));
  }

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

const removeNodeOp = (op: Diff) => (map: any, doc: Element) => {
  const { index, obj, path } = op;

  const slatePath = toSlatePath(path);

  const parent = getTarget(doc, slatePath);
  const target = (parent &&
    parent.children &&
    parent.children[index as number]) ||
    (parent && parent[index as number]) || { children: [] };

  if (!target) {
    throw new TypeError('Target is not found!');
  }

  if (!Object.prototype.hasOwnProperty.call(map, obj)) {
    map[obj] = target;
  }

  if (!Number.isInteger(index)) {
    throw new TypeError('Index is not a number');
  }

  return {
    type: 'remove_node',
    path: slatePath.length ? slatePath.concat(index) : [index],
    node: target,
  };
};

const opRemove = (op: Diff, [map, ops]: any) => {
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

  const fn = key === 'text' ? removeTextOp : removeNodeOp;

  return [map, [...ops, fn(op)]];
};

export { opRemove };
