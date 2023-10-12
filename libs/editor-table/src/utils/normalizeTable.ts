import type { RemoteComputer } from '@decipad/remote-computer';
import { NormalizerReturnValue } from '@decipad/editor-plugins';
import {
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  TableCaptionElement,
  TableCellElement,
  TableColumnFormulaElement,
  TableElement,
  TableHeaderElement,
  TableRowElement,
  TableVariableNameElement,
} from '@decipad/editor-types';
import {
  insertNodes,
  isElementOfType,
  normalizeIdentifierElement,
} from '@decipad/editor-utils';
import {
  enumerate,
  generateColumnName,
  generateTableName,
} from '@decipad/utils';
import {
  ChildOf,
  TNodeEntry,
  deleteText,
  getChildren,
  getNodeChildren,
  hasNode,
  isElement,
  isText,
  setNodes,
  unwrapNodes,
  wrapNodes,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import { convertLegacyType } from './convertLegacyType';
import { createTableCaption } from './createTableCaption';

const normalizeTableStructure = (
  editor: MyEditor,
  [node, path]: TNodeEntry<TableElement>
): NormalizerReturnValue => {
  const [caption, header, ...body] = node.children;

  // caption
  if (!caption) {
    return () =>
      insertNodes<TableCaptionElement>(
        editor,
        [createTableCaption({ id: node.id })],
        { at: [...path, 0] }
      );
  }
  if (caption.type !== ELEMENT_TABLE_CAPTION) {
    return () => deleteText(editor, { at: [...path, 0] });
  }
  // header
  if (!header) {
    return () =>
      insertNodes(
        editor,
        [
          {
            id: nanoid(),
            type: ELEMENT_TR,
            children: [
              {
                id: nanoid(),
                type: ELEMENT_TH,
                cellType: {
                  kind: 'string',
                },
                children: [{ text: '' }],
              },
            ],
          } as unknown as TableRowElement,
        ],
        { at: [...path, 1] }
      );
  }

  if (header.type !== ELEMENT_TR) {
    return () => deleteText(editor, { at: [...path, 1] });
  }

  // body
  let rowIndex = -1;
  for (const row of body) {
    rowIndex += 1;
    if (row.type !== ELEMENT_TR) {
      // eslint-disable-next-line no-loop-func
      return () => deleteText(editor, { at: [...path, 2 + rowIndex] });
    }
  }

  return false;
};

const normalizeTableCaption = (
  editor: MyEditor,
  entry: TNodeEntry<TableElement>,
  computer: RemoteComputer
): NormalizerReturnValue => {
  const [caption] = getChildren(entry);
  for (const [captionChildIndex, captionChild] of enumerate(
    getChildren(caption)
  )) {
    const [captionChildNode, captionChildPath] = captionChild;
    if (
      captionChildIndex === 0 &&
      isElement(captionChildNode) &&
      !isElementOfType(captionChildNode, ELEMENT_TABLE_VARIABLE_NAME)
    ) {
      return () =>
        insertNodes(
          editor,
          [
            {
              id: nanoid(),
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
          { at: [...caption[1], 0] }
        );
    }
    if (isText(captionChildNode)) {
      return () =>
        wrapNodes<TableVariableNameElement | TableColumnFormulaElement>(
          editor,
          {
            id: nanoid(),
            type:
              captionChildIndex === 0
                ? ELEMENT_TABLE_VARIABLE_NAME
                : ELEMENT_TABLE_COLUMN_FORMULA,
            children: [captionChildNode],
          } as TableVariableNameElement,
          { at: captionChildPath }
        );
    }
  }

  const [varName] = getChildren(caption);
  const [varNameText] = getChildren(varName);
  return normalizeIdentifierElement(editor, varNameText, () =>
    computer.getAvailableIdentifier(generateTableName())
  );
};

const normalizeTableHeaderCell = (
  editor: MyEditor,
  path: Path,
  th: TableHeaderElement,
  computer: RemoteComputer
): NormalizerReturnValue => {
  if (isText(th)) {
    return () =>
      wrapNodes<TableHeaderElement>(
        editor,
        {
          id: th.id,
          type: ELEMENT_TH,
          cellType: {
            kind: 'string',
          },
          children: [th],
        },
        {
          at: path,
        }
      );
  }

  if (isElement(th) && th.type !== ELEMENT_TH) {
    const replaceWith: Partial<TableHeaderElement> = {
      type: ELEMENT_TH,
    };
    return () =>
      setNodes(editor, replaceWith, {
        at: path,
      });
  }

  if (!th.cellType) {
    const insert: Partial<TableHeaderElement> = {
      cellType: { kind: 'string' },
    };
    return () =>
      setNodes(editor, insert, {
        at: path,
      });
  }

  if (th.cellType.kind === 'number') {
    const newCellType = convertLegacyType(th.cellType);
    if (newCellType) {
      return () => setNodes(editor, { cellType: newCellType }, { at: path });
    }
  }

  let childIndex = -1;
  for (const el of th.children || []) {
    childIndex += 1;
    if (isElement(el) && el.type === ELEMENT_TABLE_COLUMN_FORMULA) {
      break;
    }
    if (!isText(el)) {
      // eslint-disable-next-line no-loop-func
      return () => unwrapNodes(editor, { at: [...path, childIndex] });
    }
  }

  const [text] = getChildren([th, path]);
  return normalizeIdentifierElement(editor, text, () =>
    computer.getAvailableIdentifier(generateColumnName(), path[2] + 1, false)
  );
};

const normalizeTableHeaderRow = (
  editor: MyEditor,
  [node, path]: TNodeEntry<TableElement>,
  computer: RemoteComputer
): NormalizerReturnValue => {
  const headerRow = node.children[1];
  const headerRowPath = [...path, 1];
  if (headerRow.type !== ELEMENT_TR) {
    return () =>
      setNodes(
        editor,
        { type: ELEMENT_TR },
        {
          at: headerRowPath,
        }
      );
  }
  let thIndex = -1;
  for (const th of headerRow.children) {
    thIndex += 1;
    const thPath = [...headerRowPath, thIndex];
    const normalize = normalizeTableHeaderCell(editor, thPath, th, computer);
    if (normalize) {
      return normalize;
    }
  }

  return false;
};

const normalizeTableDataCell = (
  editor: MyEditor,
  [node, path]: TNodeEntry<TableCellElement>
): NormalizerReturnValue => {
  if (isText(node)) {
    return () =>
      wrapNodes(
        editor,
        {
          id: node.id,
          type: ELEMENT_TD,
          children: [node],
        },
        {
          at: path,
        }
      );
  }

  if (node.type !== ELEMENT_TD) {
    return () =>
      setNodes(
        editor,
        { type: ELEMENT_TD },
        {
          at: path,
        }
      );
  }

  let childIndex = -1;
  for (const el of node.children || []) {
    childIndex += 1;
    if (!isText(el)) {
      // eslint-disable-next-line no-loop-func
      return () => unwrapNodes(editor, { at: [...path, childIndex] });
    }
  }

  return false;
};

const normalizeTableDataRow = (
  editor: MyEditor,
  [, path]: TNodeEntry<TableRowElement>
): NormalizerReturnValue => {
  for (const [cell, cellPath] of getNodeChildren<ChildOf<TableRowElement>>(
    editor,
    path
  )) {
    const normalize = normalizeTableDataCell(editor, [cell, cellPath]);
    if (normalize) {
      return normalize;
    }
  }
  return false;
};

const normalizeTableDataRows = (
  editor: MyEditor,
  [, path]: TNodeEntry<TableElement>
): NormalizerReturnValue => {
  for (const [row, rowPath] of Array.from(
    getNodeChildren<ChildOf<TableElement, 2>>(editor, path)
  ).slice(2)) {
    if (row.type !== ELEMENT_TR) {
      return () =>
        setNodes(
          editor,
          { type: ELEMENT_TR },
          {
            at: rowPath,
          }
        );
    }
    const normalize = normalizeTableDataRow(editor, [row, rowPath]);
    if (normalize) {
      return normalize;
    }
  }
  return false;
};

const normalizeTableRowColumnCount = (
  editor: MyEditor,
  [, path]: TNodeEntry<TableElement>
): NormalizerReturnValue => {
  let rowIndex = -1;
  let columnCount = -1;
  for (const [row, rowPath] of Array.from(getNodeChildren(editor, path)).slice(
    1
  )) {
    rowIndex += 1;
    if (!isElement(row)) {
      return false;
    }
    const rowChildCount = row.children?.length;
    if (rowIndex === 0 && columnCount < 0) {
      columnCount = rowChildCount;
    } else if (columnCount >= 0) {
      if (rowChildCount > columnCount) {
        const deleteAt = [...rowPath, columnCount];
        return () => deleteText(editor, { at: deleteAt });
      }
      if (rowChildCount < columnCount) {
        const insertAt = [...rowPath, rowChildCount];
        return () =>
          insertNodes(
            editor,
            [
              {
                id: nanoid(),
                type: ELEMENT_TD,
                children: [{ text: '' }],
              },
            ],
            { at: insertAt }
          );
      }
    }
  }
  return false;
};

const normalizeTableRowCount = (
  editor: MyEditor,
  [, path]: TNodeEntry<TableElement>
): NormalizerReturnValue => {
  // at least two rows of data
  for (const rowIndex of [2]) {
    const firstDataRowPath = [...path, rowIndex];
    if (!hasNode(editor, firstDataRowPath)) {
      return () =>
        insertNodes(
          editor,
          [
            {
              id: nanoid(),
              type: ELEMENT_TR,
              children: [
                {
                  id: nanoid(),
                  type: ELEMENT_TD,
                  children: [{ text: '' }],
                },
              ],
            },
          ],
          { at: firstDataRowPath }
        );
    }
  }
  return false;
};

export const normalizeTable = (
  editor: MyEditor,
  computer: RemoteComputer,
  entry: TNodeEntry<TableElement>
): NormalizerReturnValue => {
  return (
    normalizeTableStructure(editor, entry) ||
    normalizeTableCaption(editor, entry, computer) ||
    normalizeTableHeaderRow(editor, entry, computer) ||
    normalizeTableDataRows(editor, entry) ||
    normalizeTableRowColumnCount(editor, entry) ||
    normalizeTableRowCount(editor, entry)
  );
};
