import type { RemoteComputer } from '@decipad/remote-computer';
import { NormalizerReturnValue } from '@decipad/editor-plugins';
import {
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
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
  EElement,
  EElementOrText,
  ENodeEntry,
  ElementOf,
  PlateEditor,
  TEditor,
  TNodeEntry,
  TNodeProps,
  Value,
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

const normalizeTableStructure = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
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
          } as EElementOrText<TV>,
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

const normalizeTableCaption = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
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
            } as EElement<TV>,
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
  return normalizeIdentifierElement<TV, TE>(
    editor,
    varNameText as ENodeEntry<TV>,
    () => computer.getAvailableIdentifier(generateTableName())
  );
};

const normalizeTableHeaderCell = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
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
      setNodes(editor, replaceWith as Partial<TNodeProps<TEditor<TV>>>, {
        at: path,
      });
  }

  if (!th.cellType) {
    const insert: Partial<TableHeaderElement> = {
      cellType: { kind: 'string' },
    };
    return () =>
      setNodes(editor, insert as Partial<TNodeProps<TEditor<TV>>>, {
        at: path,
      });
  }

  if (th.cellType.kind === 'number') {
    const newCellType = convertLegacyType(th.cellType);
    if (newCellType) {
      return () =>
        setNodes(
          editor,
          { cellType: newCellType } as unknown as Partial<
            TNodeProps<TEditor<TV>>
          >,
          { at: path }
        );
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
  return normalizeIdentifierElement<TV, TE>(
    editor,
    text as ENodeEntry<TV>,
    () =>
      computer.getAvailableIdentifier(generateColumnName(), path[2] + 1, false)
  );
};

const normalizeTableHeaderRow = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
  [node, path]: TNodeEntry<TableElement>,
  computer: RemoteComputer
): NormalizerReturnValue => {
  const headerRow = node.children[1];
  const headerRowPath = [...path, 1];
  if (headerRow.type !== ELEMENT_TR) {
    return () =>
      setNodes(
        editor,
        { type: ELEMENT_TR } as unknown as Partial<TNodeProps<TEditor<TV>>>,
        {
          at: headerRowPath,
        }
      );
  }
  let thIndex = -1;
  for (const th of headerRow.children) {
    thIndex += 1;
    const thPath = [...headerRowPath, thIndex];
    const normalize = normalizeTableHeaderCell<TV, TE>(
      editor,
      thPath,
      th,
      computer
    );
    if (normalize) {
      return normalize;
    }
  }

  return false;
};

const normalizeTableDataCell = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
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
        } as ElementOf<TEditor<TV>>,
        {
          at: path,
        }
      );
  }

  if (node.type !== ELEMENT_TD) {
    return () =>
      setNodes(
        editor,
        { type: ELEMENT_TD } as unknown as Partial<TNodeProps<TEditor<TV>>>,
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

const normalizeTableDataRow = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
  [, path]: TNodeEntry<TableRowElement>
): NormalizerReturnValue => {
  for (const [cell, cellPath] of getNodeChildren<ChildOf<TableRowElement>>(
    editor,
    path
  )) {
    const normalize = normalizeTableDataCell<TV, TE>(editor, [cell, cellPath]);
    if (normalize) {
      return normalize;
    }
  }
  return false;
};

const normalizeTableDataRows = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
  [, path]: TNodeEntry<TableElement>
): NormalizerReturnValue => {
  for (const [row, rowPath] of Array.from(
    getNodeChildren<ChildOf<TableElement, 2>>(editor, path)
  ).slice(2)) {
    if (row.type !== ELEMENT_TR) {
      return () =>
        setNodes(
          editor,
          { type: ELEMENT_TR } as unknown as Partial<TNodeProps<TE>>,
          {
            at: rowPath,
          }
        );
    }
    const normalize = normalizeTableDataRow<TV, TE>(editor, [row, rowPath]);
    if (normalize) {
      return normalize;
    }
  }
  return false;
};

const normalizeTableRowColumnCount = <
  TV extends Value,
  TE extends PlateEditor<TV>
>(
  editor: TE,
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
              } as EElementOrText<TV>,
            ],
            { at: insertAt }
          );
      }
    }
  }
  return false;
};

const normalizeTableRowCount = <TV extends Value, TE extends PlateEditor<TV>>(
  editor: TE,
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
            } as EElementOrText<TV>,
          ],
          { at: firstDataRowPath }
        );
    }
  }
  return false;
};

export const normalizeTable = <
  TV extends Value = Value,
  TE extends PlateEditor<TV> = PlateEditor<TV>
>(
  editor: TE,
  computer: RemoteComputer,
  entry: TNodeEntry<TableElement>
): NormalizerReturnValue => {
  return (
    normalizeTableStructure<TV, TE>(editor, entry) ||
    normalizeTableCaption<TV, TE>(editor, entry, computer) ||
    normalizeTableHeaderRow<TV, TE>(editor, entry, computer) ||
    normalizeTableDataRows<TV, TE>(editor, entry) ||
    normalizeTableRowColumnCount<TV, TE>(editor, entry) ||
    normalizeTableRowCount<TV, TE>(editor, entry)
  );
};
