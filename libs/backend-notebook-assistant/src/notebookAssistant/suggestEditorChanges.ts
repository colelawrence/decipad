/* eslint-disable no-console */
/* eslint-disable complexity */
import {
  type TNode,
  type TNodeEntry,
  type TOperation,
  type TPath,
  getNodeString,
  isElement,
  isNode,
  isText,
  withoutNormalizing,
  TEditor,
} from '@udecode/plate';
import { JSONPatchISOFormatOp } from 'jsondiffpatch';
import stringify from 'json-stringify-safe';
import set from 'lodash.set';
import cloneDeep from 'lodash.clonedeep';
import {
  NotebookValue,
  RootDocument,
  createTPlateEditor,
} from '@decipad/editor-types';
import { getDefined, noop } from '@decipad/utils';
import { diff } from '../utils/diff';
import { createSubDebug } from '../debug';

const debug = createSubDebug('suggestEditorChanges');

const MAX_DEPTH = 1000;

const isNotEmptyString = (s: string) => s.length > 0;

type RemainderPath = Array<string>;
type TNodeEntryWithRemainderPathAndParentNode = [
  ...TNodeEntry,
  RemainderPath,
  TNodeEntry | undefined
];

const deltaToSlateOperation = (
  previous: RootDocument,
  delta: JSONPatchISOFormatOp
): TOperation[] => {
  debug('deltaToSlateOperation previous', stringify(previous, null, '\t'));
  debug('deltaToSlateOperation delta', delta);
  debug('deltaToSlateOperation previous', stringify(previous, null, '\t'));
  const deltaToSlatePath = (
    path: string
  ): TNodeEntryWithRemainderPathAndParentNode => {
    const pathParts = path.split('/').filter(isNotEmptyString);
    debug('deltaToSlateOperation pathParts:', pathParts);
    const slatePath: TPath = [];
    let current: TNode | Array<TNode> | RootDocument | undefined = previous;
    const remainder = [...pathParts];
    let beforeCurrent: undefined | TNode;
    while (remainder.length > 0 && current != null) {
      const pathPart = getDefined(remainder.shift());
      if (pathPart === 'children') {
        if (!isElement(current)) {
          throw new TypeError(
            `tried to access children of invalid element ${stringify(current)}`
          );
        }
        beforeCurrent = current;
        current = current.children;
        continue;
      }
      const pathIndex = parseInt(pathPart, 10);
      if (Number.isNaN(pathIndex)) {
        // this path index is a node property
        remainder.unshift(pathPart);
        break;
      }

      if (!Array.isArray(current)) {
        console.error(current);
        throw new TypeError('expected current to be array');
      }
      current = current[pathIndex];
      slatePath.push(pathIndex);
    }
    if (!current && isNode(beforeCurrent)) {
      // new element
      current = beforeCurrent;
    }
    if (!isNode(current)) {
      throw new Error(`current is not a node: ${stringify(current)}`);
    }
    return [
      current,
      slatePath,
      remainder,
      beforeCurrent ? [beforeCurrent, slatePath.slice(0, -1)] : undefined,
    ];
  };

  const [node, path, remainder, parent] = deltaToSlatePath(delta.path);
  const ops: TOperation[] = [];
  switch (delta.op) {
    case 'remove': {
      if (isElement(node)) {
        if (remainder.length === 0) {
          ops.push({ type: 'remove_node', path, node });
        } else if (remainder.length > 0) {
          const [propName] = remainder;
          if (propName !== 'children') {
            ops.push({
              type: 'set_node',
              path,
              node,
              properties: { [propName]: node[propName] },
              newProperties: { [propName]: undefined },
            });
          } else if (remainder.length === 2) {
            const childIndex = parseInt(remainder[remainder.length - 1], 10);
            const removePath = [...path, childIndex];
            ops.push({
              type: 'remove_node',
              path: removePath,
              node: node.children[childIndex],
            });
          }
        }
      } else if (isText(node)) {
        if (getNodeString(node).length > 0) {
          ops.push({
            type: 'remove_node',
            path,
            node,
          });
        }

        if (
          parent &&
          isElement(parent[0]) &&
          getNodeString(parent[0]) === getNodeString(node)
        ) {
          ops.push({
            type: 'remove_node',
            path: parent[1],
            node: parent[0],
          });
        }
      }
      break;
    }
    case 'add': {
      if (isText(delta.value)) {
        ops.push({
          type: 'insert_node',
          path,
          node: delta.value,
        });
      } else if (isElement(delta.value) && remainder.length === 0) {
        ops.push({ type: 'insert_node', path, node: delta.value });
      } else if (remainder.length > 0) {
        const [propName, ...restPropName] = remainder;
        const propValue = cloneDeep(node[propName]);
        const newPropValue =
          restPropName.length > 0 &&
          propValue != null &&
          typeof propValue === 'object'
            ? set(propValue, restPropName.join('.'), delta.value)
            : delta.value;
        ops.push({
          type: 'set_node',
          path,
          node,
          properties: { [propName]: node[propName] },
          newProperties: { [propName]: newPropValue },
        });
      }
      break;
    }
    case 'replace': {
      if (isText(node)) {
        ops.push({
          type: 'insert_text',
          path,
          offset: 0,
          text: getNodeString(node),
        });
      } else {
        const [propName, ...restPropName] = remainder;
        const propValue = cloneDeep(node[propName]);
        const newPropValue =
          restPropName.length > 0 &&
          propValue != null &&
          typeof propValue === 'object'
            ? set(propValue, restPropName.join('.'), delta.value)
            : delta.value;
        ops.push({
          type: 'set_node',
          path,
          node,
          properties: { [propName]: node[propName] },
          newProperties: { [propName]: newPropValue },
        });
      }
      break;
    }
    case 'move': {
      const [, fromPath] = deltaToSlatePath(delta.from);
      ops.push({ type: 'move_node', path: fromPath, newPath: path });
      break;
    }
  }

  return ops;
};

export const suggestEditorChanges = (
  oldVersion: RootDocument,
  newVersion: RootDocument,
  depth = 0
): TOperation[] => {
  debug('suggestEditorChanges');
  debug('oldVersion', stringify(oldVersion, null, '\t'));
  debug('newVersion', stringify(newVersion, null, '\t'));
  const ops = diff()(oldVersion, newVersion);
  if (!ops) {
    throw new Error('Could not create a delta from old and new version');
  }
  if (!ops.length) {
    return [];
  }
  if (depth === MAX_DEPTH) {
    console.error('Maximum depth of suggestEditorChanges reached');
    console.error('oldVersion', stringify(oldVersion));
    console.error('newVersion', stringify(newVersion));
    throw new Error('Maximum depth of suggestEditorChanges reached');
  }
  // we need to apply one diff at a time so that the paths match the current state after individual application
  const editor = createTPlateEditor() as unknown as TEditor<NotebookValue>;
  editor.children = oldVersion.children;
  editor.normalize = noop; // prevent normalisation
  let applied = false;
  const appliedOps: TOperation[] = [];
  withoutNormalizing(editor, () => {
    while (!applied && ops.length > 0) {
      const op = ops.shift();
      if (!op) {
        continue;
      }
      const slateOps = deltaToSlateOperation(oldVersion, op);
      // eslint-disable-next-line no-loop-func
      for (const slateOp of slateOps) {
        if (!slateOp) {
          continue;
        }
        debug('applying slate op', slateOp);
        try {
          editor.apply(slateOp);
          appliedOps.push(slateOp);
          applied = true;
        } catch (err) {
          console.error(err);
          // it's fine, sometimes this happens because the
          // jsondiffpatch formatted gives invalid remove
          // operations because it's dumb.
        }
      }
      debug(
        'editor.children after apply: ',
        stringify(editor.children, null, '\t')
      );
    }
  });

  debug('applied ops:', appliedOps);

  return appliedOps.concat(
    suggestEditorChanges({ children: editor.children }, newVersion, depth + 1)
  );
};
