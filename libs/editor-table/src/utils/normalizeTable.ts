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
  ChildOf,
  deleteText,
  getChildren,
  getNodeChildren,
  hasNode,
  isElement,
  isText,
  setNodes,
  TNodeEntry,
  unwrapNodes,
  wrapNodes,
} from '@udecode/plate';
import { enumerate } from '@decipad/utils';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import { Computer } from '@decipad/computer';
import { createTableCaption } from './createTableCaption';
import { convertLegacyType } from './convertLegacyType';

const normalizeTableStructure = (
  editor: MyEditor,
  [node, path]: TNodeEntry<TableElement>
): boolean => {
  const [caption, header, ...body] = node.children;

  // caption
  if (!caption) {
    insertNodes<TableCaptionElement>(
      editor,
      createTableCaption({ id: node.id }),
      { at: [...path, 0] }
    );
    return true;
  }
  if (caption.type !== ELEMENT_TABLE_CAPTION) {
    deleteText(editor, { at: [...path, 0] });
    return true;
  }

  // header
  if (!header) {
    insertNodes(
      editor,
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
      { at: [...path, 1] }
    );
    return true;
  }

  if (header.type !== ELEMENT_TR) {
    deleteText(editor, { at: [...path, 1] });
    return true;
  }

  // body
  let rowIndex = -1;
  for (const row of body) {
    rowIndex += 1;
    if (row.type !== ELEMENT_TR) {
      deleteText(editor, { at: [...path, 2 + rowIndex] });
    }
  }

  return false;
};

const normalizeTableCaption = (
  editor: MyEditor,
  entry: TNodeEntry<TableElement>,
  computer: Computer
): boolean => {
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
      insertNodes(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_TABLE_VARIABLE_NAME,
          children: [{ text: '' }],
        },
        { at: [...caption[1], 0] }
      );
      return true;
    }

    if (isText(captionChildNode)) {
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
      return true;
    }
  }

  const [varName] = getChildren(caption);
  const [varNameText] = getChildren(varName);
  return normalizeIdentifierElement(editor, varNameText, () =>
    computer.getAvailableIdentifier('Table', 1)
  );
};

const normalizeTableHeaderCell = (
  editor: MyEditor,
  path: Path,
  th: TableHeaderElement,
  computer: Computer
): boolean => {
  if (isText(th)) {
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
    return true;
  }

  if (isElement(th) && th.type !== ELEMENT_TH) {
    const replaceWith: Partial<TableHeaderElement> = {
      type: ELEMENT_TH,
    };
    setNodes(editor, replaceWith, {
      at: path,
    });
    return true;
  }

  if (!th.cellType) {
    const insert: Partial<TableHeaderElement> = {
      cellType: { kind: 'string' },
    };
    setNodes(editor, insert, {
      at: path,
    });
    return true;
  }

  if (typeof th.cellType === 'string') {
    const insert: Partial<TableHeaderElement> = {
      cellType: { kind: th.cellType },
    };
    setNodes(editor, insert, {
      at: path,
    });
    return true;
  }

  if (th.cellType.kind === 'number') {
    const newCellType = convertLegacyType(th.cellType);
    if (newCellType) {
      setNodes(editor, { cellType: newCellType }, { at: path });
      return true;
    }
  }

  let childIndex = -1;
  for (const el of th.children || []) {
    childIndex += 1;
    if (isElement(el) && el.type === ELEMENT_TABLE_COLUMN_FORMULA) {
      break;
    }
    if (!isText(el)) {
      unwrapNodes(editor, { at: [...path, childIndex] });
      return true;
    }
  }

  const [text] = getChildren([th, path]);
  return normalizeIdentifierElement(editor, text, () =>
    computer.getAvailableIdentifier('Column', path[2] + 1)
  );
};

const normalizeTableHeaderRow = (
  editor: MyEditor,
  [node, path]: TNodeEntry<TableElement>,
  computer: Computer
): boolean => {
  const headerRow = node.children[1];
  const headerRowPath = [...path, 1];
  if (headerRow.type !== ELEMENT_TR) {
    setNodes(
      editor,
      { type: ELEMENT_TR },
      {
        at: headerRowPath,
      }
    );
    return true;
  }

  let thIndex = -1;
  for (const th of headerRow.children) {
    thIndex += 1;
    const thPath = [...headerRowPath, thIndex];
    if (normalizeTableHeaderCell(editor, thPath, th, computer)) {
      return true;
    }
  }

  return false;
};

const normalizeTableDataCell = (
  editor: MyEditor,
  [node, path]: TNodeEntry<TableCellElement>
): boolean => {
  if (isText(node)) {
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
    return true;
  }

  if (node.type !== ELEMENT_TD) {
    setNodes(
      editor,
      { type: ELEMENT_TD },
      {
        at: path,
      }
    );
    return true;
  }

  let childIndex = -1;
  for (const el of node.children || []) {
    childIndex += 1;
    if (!isText(el)) {
      unwrapNodes(editor, { at: [...path, childIndex] });
      return true;
    }
  }

  return false;
};

const normalizeTableDataRow = (
  editor: MyEditor,
  [, path]: TNodeEntry<TableRowElement>
): boolean => {
  for (const [cell, cellPath] of getNodeChildren<ChildOf<TableRowElement>>(
    editor,
    path
  )) {
    if (normalizeTableDataCell(editor, [cell, cellPath])) {
      return true;
    }
  }
  return false;
};

const normalizeTableDataRows = (
  editor: MyEditor,
  [, path]: TNodeEntry<TableElement>
): boolean => {
  for (const [row, rowPath] of Array.from(
    getNodeChildren<ChildOf<TableElement, 2>>(editor, path)
  ).slice(2)) {
    if (row.type !== ELEMENT_TR) {
      setNodes(
        editor,
        { type: ELEMENT_TR },
        {
          at: rowPath,
        }
      );
      return true;
    }
    if (normalizeTableDataRow(editor, [row, rowPath])) {
      return true;
    }
  }
  return false;
};

const normalizeTableRowColumnCount = (
  editor: MyEditor,
  [, path]: TNodeEntry<TableElement>
): boolean => {
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
        deleteText(editor, { at: deleteAt });
        return true;
      }
      if (rowChildCount < columnCount) {
        const insertAt = [...rowPath, rowChildCount];
        insertNodes(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
          { at: insertAt }
        );
        return true;
      }
    }
  }
  return false;
};

const normalizeTableRowCount = (
  editor: MyEditor,
  [, path]: TNodeEntry<TableElement>
): boolean => {
  // at least two rows of data
  for (const rowIndex of [2]) {
    const firstDataRowPath = [...path, rowIndex];
    if (!hasNode(editor, firstDataRowPath)) {
      insertNodes(
        editor,
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
        { at: firstDataRowPath }
      );
      return true;
    }
  }
  return false;
};

export const normalizeTable = (
  editor: MyEditor,
  computer: Computer,
  entry: TNodeEntry<TableElement>
): boolean => {
  return (
    normalizeTableStructure(editor, entry) ||
    normalizeTableCaption(editor, entry, computer) ||
    normalizeTableHeaderRow(editor, entry, computer) ||
    normalizeTableDataRows(editor, entry) ||
    normalizeTableRowColumnCount(editor, entry) ||
    normalizeTableRowCount(editor, entry)
  );
};
