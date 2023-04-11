import {
  NormalizerReturnValue,
  createNormalizerPlugin,
} from '@decipad/editor-plugins';
import {
  ELEMENT_DATA_VIEW,
  MyEditor,
  MyNodeEntry,
  TableColumnFormulaElement,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_DATA_VIEW_TR,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
  ELEMENT_TABLE_COLUMN_FORMULA,
  DataViewCaptionElement,
  DataViewElement,
  DataViewHeaderRowElement,
  DataViewNameElement,
} from '@decipad/editor-types';
import { assertElementType, insertNodes } from '@decipad/editor-utils';
import {
  findNode,
  getChildren,
  isText,
  removeNodes,
  setNodes,
  wrapNodes,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { NodeEntry } from 'slate';

const normalizeDataViewElement = (
  editor: MyEditor,
  entry: NodeEntry<DataViewElement>
): NormalizerReturnValue => {
  const [node, path] = entry;

  if (!node.children) {
    return () => setNodes(editor, { children: [{ text: '' }] }, { at: path });
  }

  if (node.children.length < 1) {
    return () =>
      insertNodes<DataViewCaptionElement>(
        editor,
        [
          {
            id: nanoid(),
            type: ELEMENT_DATA_VIEW_CAPTION,
            children: [
              {
                id: nanoid(),
                type: ELEMENT_DATA_VIEW_NAME,
                children: [{ text: '' }],
              },
            ],
          },
        ],
        { at: [...path, 0] }
      );
  }
  if (node.children.length < 2) {
    return () =>
      insertNodes<DataViewHeaderRowElement>(
        editor,
        [
          {
            id: nanoid(),
            type: ELEMENT_DATA_VIEW_TR,
            children: [],
          },
        ],
        { at: [...path, 1] }
      );
  }

  if (node.children[0].type !== ELEMENT_DATA_VIEW_CAPTION) {
    return () =>
      setNodes(
        editor,
        { type: ELEMENT_DATA_VIEW_CAPTION },
        { at: [...path, 0] }
      );
  }

  if (node.children[0].children.length < 1) {
    return () =>
      insertNodes<DataViewNameElement>(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_DATA_VIEW_NAME,
          children: [{ text: '' }],
        },
        { at: [...path, 0, 0] }
      );
  }
  if (node.children[0].children[0]?.type !== ELEMENT_DATA_VIEW_NAME) {
    const dataViewName = node.children[0].children[0];
    if (isText(dataViewName)) {
      return () =>
        wrapNodes(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_DATA_VIEW_NAME,
            children: [dataViewName],
          },
          { at: [...path, 0, 0] }
        );
    }
    return () =>
      setNodes(
        editor,
        { type: ELEMENT_DATA_VIEW_NAME },
        { at: [...path, 0, 0] }
      );
  }

  if (node.children[1].type !== ELEMENT_DATA_VIEW_TR) {
    return () => removeNodes(editor, { at: [...path, 1] });
  }

  return false;
};

const normalizeDataViewHeaders = (
  editor: MyEditor,
  entry: NodeEntry<DataViewElement>
): NormalizerReturnValue => {
  const [node, path] = entry;
  if (!node.children[1].children) {
    return () =>
      setNodes<DataViewHeaderRowElement>(
        editor,
        { children: [] },
        { at: path }
      );
  }

  // Migrate old IDs, which referred to the formula ID, to the column ID
  for (const [child, childPath] of getChildren([
    node.children[1],
    [...path, 1],
  ])) {
    const byId = findNode<TableColumnFormulaElement>(editor, {
      match: { id: child.name },
    });
    const formulaEl = byId?.[0];
    if (formulaEl?.type === ELEMENT_TABLE_COLUMN_FORMULA) {
      return () =>
        setNodes(editor, { name: formulaEl.columnId }, { at: childPath });
    }
  }

  return false;
};

const normalizeDataViewPlugin =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node] = entry;
    assertElementType(node, ELEMENT_DATA_VIEW);
    return (
      normalizeDataViewElement(editor, entry as NodeEntry<DataViewElement>) ||
      normalizeDataViewHeaders(editor, entry as NodeEntry<DataViewElement>)
    );
  };

export const createNormalizeDataViewPlugin = () =>
  createNormalizerPlugin({
    name: 'PLUGIN_NORMALIZE_DATA_VIEW',
    elementType: ELEMENT_DATA_VIEW,
    acceptableElementProperties: [
      'expandedGroups',
      'varName',
      'color',
      'icon',
      'rotate',
      'alternateRotation',
    ],
    acceptableSubElements: [ELEMENT_TABLE_CAPTION, ELEMENT_DATA_VIEW_TR],
    plugin: normalizeDataViewPlugin,
  });
