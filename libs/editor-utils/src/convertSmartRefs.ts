import { Computer, getUsedIdentifiers, tokenize } from '@decipad/computer';
import {
  ELEMENT_SMART_REF,
  MyEditor,
  MyNode,
  SmartRefElement,
  TableElement,
} from '@decipad/editor-types';
import {
  ELEMENT_TABLE,
  getNextNode,
  getNodeChildren,
  getNodeString,
  insertText,
  isElement,
  removeNodes,
  setSelection,
  withoutNormalizing,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { BaseEditor, Editor, Location, Path, Point, Range } from 'slate';
import { captureException } from '@sentry/react';
import { insertNodes } from './insertNodes';
import { isElementOfType } from './isElementOfType';

export const convertCodeSmartRefs = (
  editor: MyEditor,
  path: Path,
  computer: Computer
) => {
  try {
    const keepGoing = true;
    outer: while (keepGoing) {
      const children = Array.from(getNodeChildren(editor, path));
      for (const lineChild of children) {
        const [lineChildNode, lineChildPath] = lineChild;
        // add or extend smart refs
        if (handleNode(lineChildNode, lineChildPath, editor, computer)) {
          continue outer;
        }
      }
      return;
    }
  } catch (err) {
    console.error('Error caught trying to convert to smart ref', err);
    captureException(err);
  }
};

type VarAndCol = [string, string | null];

export const handleNode = (
  node: MyNode,
  path: Path,
  editor: MyEditor,
  computer: Computer
) => {
  const names = computer
    .getNamesDefined()
    .flatMap((n): [VarAndCol, VarAndCol][] => {
      if (n.kind === 'variable' && n.blockId) {
        return [
          [
            [n.name, null],
            [n.blockId, null],
          ],
        ];
      }
      if (n.kind === 'column' && n.blockId && n.columnId) {
        return [
          [n.name.split('.') as [string, string], [n.blockId, n.columnId]],
        ];
      }
      return [];
    });
  const namesToIds = names;
  const idsToNames = names.map((n) => [n[1], n[0]] as [VarAndCol, VarAndCol]);

  const inTableId =
    Editor.above<TableElement>(editor as BaseEditor, {
      at: path,
      match: (n) => isElementOfType(n, ELEMENT_TABLE),
    })?.[0].id ?? null;

  // text
  if (!isElement(node)) {
    return handleTextNode(node, path, editor, inTableId, namesToIds);
  }
  // smart ref
  if (node.type === ELEMENT_SMART_REF) {
    return handleSmartRefNode(node, path, editor, idsToNames);
  }

  return false;
};

const handleSmartRefNode = (
  node: SmartRefElement,
  path: Path,
  editor: MyEditor,
  idsToNames: [VarAndCol, VarAndCol][]
) => {
  const curName = find(idsToNames, node.blockId, node.columnId);
  if (
    !curName ||
    node.columnId ===
      undefined /* legacy, handled in migrateTableColumnSmartRefs */
  ) {
    return false;
  }

  const nextEntry = getNextNode(editor, { at: path });
  if (nextEntry) {
    const [nextNode, nextPath] = nextEntry;
    const nextNodeStr = getNodeString(nextNode);
    const nextTokens = tokenize(nextNodeStr).filter((t) => t?.type !== 'ws');

    // turn smart ref into text if it's in the LHS of a declaration
    if (nextTokens[0]?.type === 'equalSign') {
      withoutNormalizing(editor, () => {
        insertText(editor, curName.filter((n) => n != null).join('.'), {
          at: { path: nextPath, offset: 0 },
        });
        removeNodes(editor, { at: path });
      });
      return true;
    }
  }
  return false;
};
const handleTextNode = (
  node: MyNode,
  path: Path,
  editor: MyEditor,
  inTableId: string | null,
  namesToIds: [VarAndCol, VarAndCol][]
) => {
  const fullStr = getNodeString(node);
  const identifs = getUsedIdentifiers(fullStr);

  for (const token of identifs) {
    let blockIdAndColumn;
    if (!token.isDeclaration && token.tableColumn) {
      blockIdAndColumn = find(
        namesToIds,
        token.tableColumn[0],
        token.tableColumn[1]
      );
    } else if (!token.isDeclaration && !token.isBeforeDot) {
      blockIdAndColumn =
        find(namesToIds, token.text, null) ??
        namesToIds.flatMap(([[, columnName], [tableId, columnId]]) =>
          inTableId != null &&
          tableId === inTableId &&
          columnName === token.text
            ? [[columnId, null] as VarAndCol]
            : []
        )?.[0];
    }

    if (blockIdAndColumn) {
      const start = { path, offset: token.start };
      const end = { path, offset: token.end };
      const textRange = { anchor: start, focus: end };
      const inside =
        editor.selection && !!Range.intersection(editor.selection, textRange);

      // dont replace if selection is inside or right next to the var name
      if (inside) {
        return false;
      }
      replaceTextWithSmartRef(editor, textRange, ...blockIdAndColumn);
      return true;
    }
  }

  return false;
};

export const smartRefToText = (
  editor: MyEditor,
  smartRefLocation: Location,
  text: string,
  textPoint: Point
) => {
  removeNodes(editor, { at: smartRefLocation });
  insertText(editor, text, {
    at: textPoint,
  });
  setSelection(editor, { anchor: textPoint, focus: textPoint });
};

const find = (
  items: [VarAndCol, VarAndCol][],
  block: string,
  column: string | null
) => {
  for (const item of items) {
    if (item[0][0] === block && item[0][1] === column) {
      return item[1];
    }
  }
  return null;
};

const replaceTextWithSmartRef = (
  editor: MyEditor,
  textRange: Range,
  blockId: string,
  columnId: string | null
) => {
  const smartRef: SmartRefElement = {
    id: nanoid(),
    type: ELEMENT_SMART_REF,
    blockId,
    columnId,
    children: [{ text: '' }],
  };
  insertNodes(editor, [{ text: '' }, smartRef, { text: '' }], {
    at: textRange,
  });
};
