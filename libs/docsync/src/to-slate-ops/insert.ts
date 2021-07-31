import Automerge from 'automerge';
import { toSlatePath } from '../utils/to-slate-path';
import { toJS } from '../utils/to-js';
import { SyncDiff, SyncDocValue } from '../types';

const insertTextOp =
  ({ index, path, value }: SyncDiff) =>
  () => ({
    type: 'insert_text',
    path: toSlatePath(path),
    offset: index,
    text: value,
    marks: [],
  });

const insertNodeOp =
  ({ value, obj, index, path }: SyncDiff, doc: SyncDocValue) =>
  (map: any) => {
    const ops: any = [];

    const iterate = ({ children, ...json }: any, path: any) => {
      const node = children ? { ...json, children: [] } : json;

      ops.push({
        type: 'insert_node',
        path,
        node,
      });

      children &&
        children.forEach((n: any, i: number) => {
          const node = map[n] || Automerge.getObjectById(doc, n);

          iterate((node && toJS(node)) || n, [...path, i]);
        });
    };

    const source =
      map[value] || toJS(map[obj] || Automerge.getObjectById(doc, value));

    source && iterate(source, [...toSlatePath(path), index]);

    return ops;
  };

export function opInsert(op: SyncDiff, [map, ops]: any, doc: SyncDocValue) {
  const { link, obj, path, index, type, value } = op;

  if (link && Object.prototype.hasOwnProperty.call(map, obj)) {
    map[obj].splice(index, 0, map[value] || value);
  } else if ((type === 'text' || type === 'list') && !path) {
    map[obj] = map[obj]
      ? map[obj].slice(0, index).concat(value).concat(map[obj].slice(index))
      : value;
  } else {
    let insert;
    let operation;
    if (type === 'text') {
      insert = insertTextOp;
    } else if (type === 'list') {
      insert = insertNodeOp;
    }
    if (insert !== undefined) {
      operation = insert(op, doc);
    }

    ops.push(operation);
  }

  return [map, ops];
}
