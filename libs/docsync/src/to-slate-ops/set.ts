import Automerge, { Diff } from 'automerge';
import { toJS } from '../utils/to-js';
import { toSlatePath } from '../utils/to-slate-path';

const setDataOp =
  ({ key = '', obj, path, value }: Diff, doc: any, before: any) =>
  (map: any) => {
    if (key === 'text') {
      return [
        {
          type: 'remove_text',
          path: toSlatePath(path),
          offset: 0,
          text: Automerge.getObjectById(before, obj).text.toString(),
        },
        {
          type: 'insert_text',
          path: toSlatePath(path),
          offset: 0,
          text: (map && map[value]) || value,
        },
      ];
    }

    const syncObj = Automerge.getObjectById(doc, obj);

    return {
      type: 'set_node',
      path: toSlatePath(path),
      properties: {
        [key]: toJS(syncObj && syncObj[key]),
      },
      newProperties: {
        [key]: (map && map[value]) || value,
      },
    };
  };

function opSet(op: Diff, [map, ops]: any, doc: any, before: any) {
  const { link, value, path, obj, key } = op;

  if (path && path.length && path[0] !== 'cursors') {
    ops.push(setDataOp(op, doc, before));
  } else if (map[obj]) {
    map[obj][key as string] = link ? map[value] : value;
  }

  return [map, ops];
}

export { opSet };
