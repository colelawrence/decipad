import {
  BaseElement,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  ELEMENT_TABLE_COLUMN_FORMULA,
  isElement,
  TableElement,
  TableHeaderElement,
  TableRowElement,
  ELEMENT_TABLE_VARIABLE_NAME,
  isText,
  TableVariableNameElement,
} from '@decipad/editor-types';
import { normalizeIdentifierElement } from '@decipad/editor-utils';
import { enumerate } from '@decipad/utils';
import { nanoid } from 'nanoid';
import {
  Descendant,
  Editor,
  Element,
  Node,
  NodeEntry,
  Path,
  Text,
  Transforms,
} from 'slate';

const normalizeTableStructure = (
  editor: Editor,
  [node, path]: NodeEntry<TableElement>
): boolean => {
  const [caption, header, ...body] = node.children;

  // caption
  if (!caption) {
    Transforms.insertNodes(
      editor,
      {
        id: node.id,
        type: ELEMENT_TABLE_CAPTION,
        children: [
          { type: ELEMENT_TABLE_VARIABLE_NAME, children: [{ text: '' }] },
        ],
      } as unknown as Node,
      { at: [...path, 0] }
    );
    return true;
  }
  if (caption.type !== ELEMENT_TABLE_CAPTION) {
    Transforms.delete(editor, { at: [...path, 0] });
    return true;
  }

  // header
  if (!header) {
    Transforms.insertNodes(
      editor,
      {
        type: ELEMENT_TR,
        children: [
          {
            type: ELEMENT_TH,
            cellType: {
              kind: 'string',
            },
            children: [{ text: '' }],
          },
        ],
      } as unknown as Node,
      { at: [...path, 1] }
    );
    return true;
  }

  if (header.type !== ELEMENT_TR) {
    Transforms.delete(editor, { at: [...path, 1] });
    return true;
  }

  // body
  let rowIndex = -1;
  for (const row of body) {
    rowIndex += 1;
    if (row.type !== ELEMENT_TR) {
      Transforms.delete(editor, { at: [...path, 2 + rowIndex] });
    }
  }

  return false;
};

const normalizeTableCaption = (
  editor: Editor,
  entry: NodeEntry<TableElement>
): boolean => {
  const [, tablePath] = entry;
  const [caption] = Node.children(editor, tablePath);
  for (const [captionChildIndex, captionChild] of enumerate(
    Node.children(editor, caption[1])
  )) {
    if (isText(captionChild[0] as Text)) {
      Transforms.wrapNodes(
        editor,
        {
          id: nanoid(),
          type:
            captionChildIndex === 0
              ? ELEMENT_TABLE_VARIABLE_NAME
              : ELEMENT_TABLE_COLUMN_FORMULA,
          children: [captionChild[0]],
        } as TableVariableNameElement,
        { at: captionChild[1] }
      );
      return true;
    }
  }

  const [varName] = Node.children(editor, caption[1]);
  const [varNameText] = Node.children(editor, varName[1]);
  return normalizeIdentifierElement(editor, varNameText as NodeEntry<Text>);
};

const normalizeTableHeaderCell = (
  editor: Editor,
  path: Path,
  th: BaseElement
): boolean => {
  if (Text.isText(th)) {
    Transforms.wrapNodes(
      editor,
      {
        id: th.id,
        type: ELEMENT_TABLE_CAPTION,
        children: [th],
      } as BaseElement,
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
    Transforms.setNodes(editor, replaceWith, {
      at: path,
    });
    return true;
  }

  if (!(th as TableHeaderElement).cellType) {
    const insert: Partial<TableHeaderElement> = {
      cellType: { kind: 'string' },
    };
    Transforms.setNodes(editor, insert, {
      at: path,
    });
    return true;
  }

  let childIndex = -1;
  for (const el of th.children || []) {
    childIndex += 1;
    if (isElement(el) && el.type === ELEMENT_TABLE_COLUMN_FORMULA) {
      break;
    }
    if (!Text.isText(el)) {
      Transforms.unwrapNodes(editor, { at: [...path, childIndex] });
      return true;
    }
  }

  const [text] = Node.children(editor, path);
  return normalizeIdentifierElement(editor, text as NodeEntry<Text>);
};

const normalizeTableHeaderRow = (
  editor: Editor,
  [node, path]: NodeEntry<Element>
): boolean => {
  const headerRow = node.children[1] as BaseElement;
  const headerRowPath = [...path, 1];
  if (headerRow.type !== ELEMENT_TR) {
    Transforms.setNodes(editor, { type: ELEMENT_TR } as Partial<Descendant>, {
      at: headerRowPath,
    });
    return true;
  }

  let thIndex = -1;
  for (const th of headerRow.children as BaseElement[]) {
    thIndex += 1;
    const thPath = [...headerRowPath, thIndex];
    if (normalizeTableHeaderCell(editor, thPath, th)) {
      return true;
    }
  }

  return false;
};

const normalizeTableDataCell = (
  editor: Editor,
  [node, path]: NodeEntry<BaseElement>
): boolean => {
  if (Text.isText(node)) {
    Transforms.wrapNodes(
      editor,
      {
        id: node.id,
        type: ELEMENT_TD,
        children: [node],
      } as BaseElement,
      {
        at: path,
      }
    );
    return true;
  }

  if (node.type !== ELEMENT_TD) {
    Transforms.setNodes(editor, { type: ELEMENT_TD } as Partial<Node>, {
      at: path,
    });
    return true;
  }

  let childIndex = -1;
  for (const el of node.children || []) {
    childIndex += 1;
    if (!Text.isText(el)) {
      Transforms.unwrapNodes(editor, { at: [...path, childIndex] });
      return true;
    }
  }

  return false;
};

const normalizeTableDataRow = (
  editor: Editor,
  [, path]: NodeEntry<TableRowElement>
): boolean => {
  for (const [cell, cellPath] of Node.children(editor, path)) {
    if (normalizeTableDataCell(editor, [cell as BaseElement, cellPath])) {
      return true;
    }
  }
  return false;
};

const normalizeTableDataRows = (
  editor: Editor,
  [, path]: NodeEntry<Element>
): boolean => {
  for (const [row, rowPath] of Array.from(Node.children(editor, path)).slice(
    2
  )) {
    if ((row as BaseElement).type !== ELEMENT_TR) {
      Transforms.setNodes(editor, { type: ELEMENT_TR } as Partial<Node>, {
        at: rowPath,
      });
      return true;
    }
    if (normalizeTableDataRow(editor, [row as TableRowElement, rowPath])) {
      return true;
    }
  }
  return false;
};

const normalizeTableRowColumnCount = (
  editor: Editor,
  [, path]: NodeEntry<Element>
): boolean => {
  let rowIndex = -1;
  let columnCount = -1;
  for (const [row, rowPath] of Array.from(Node.children(editor, path)).slice(
    1
  )) {
    rowIndex += 1;
    if (!Element.isElement(row)) {
      return false;
    }
    const rowChildCount = row.children?.length;
    if (rowIndex === 0 && columnCount < 0) {
      columnCount = rowChildCount;
    } else if (columnCount >= 0) {
      if (rowChildCount > columnCount) {
        const deleteAt = [...rowPath, columnCount];
        Transforms.delete(editor, { at: deleteAt });
        return true;
      }
      if (rowChildCount < columnCount) {
        const insertAt = [...rowPath, rowChildCount];
        Transforms.insertNodes(
          editor,
          {
            type: ELEMENT_TD,
            children: [{ text: '' }],
          } as Node,
          { at: insertAt }
        );
        return true;
      }
    }
  }
  return false;
};

const normalizeTableRowCount = (
  editor: Editor,
  [, path]: NodeEntry<Element>
): boolean => {
  // at least two rows of data
  for (const rowIndex of [2]) {
    const firstDataRowPath = [...path, rowIndex];
    if (!Editor.hasPath(editor, firstDataRowPath)) {
      Transforms.insertNodes(
        editor,
        {
          type: ELEMENT_TR,
          children: [
            {
              type: ELEMENT_TD,
              children: [{ text: '' }],
            } as Node,
          ],
        } as Node,
        { at: firstDataRowPath }
      );
      return true;
    }
  }
  return false;
};

export const normalizeTable = (
  editor: Editor,
  entry: NodeEntry<TableElement>
): boolean => {
  return (
    normalizeTableStructure(editor, entry) ||
    normalizeTableCaption(editor, entry) ||
    normalizeTableHeaderRow(editor, entry) ||
    normalizeTableDataRows(editor, entry) ||
    normalizeTableRowColumnCount(editor, entry) ||
    normalizeTableRowCount(editor, entry)
  );
};
