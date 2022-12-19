import { createNormalizerPlugin } from '@decipad/editor-plugins';
import {
  ELEMENT_DATA_VIEW,
  MyEditor,
  MyNodeEntry,
  TableCaptionElement,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { insertNodes, removeNodes, setNodes } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { NodeEntry } from 'slate';
import {
  ELEMENT_TABLE_CAPTION,
  ELEMENT_DATA_VIEW_TR,
  ELEMENT_TABLE_VARIABLE_NAME,
} from '../../../editor-types/src/element-kinds';
import {
  DataViewElement,
  DataViewHeaderRowElement,
} from '../../../editor-types/src/data-view';

const normalizeDataViewElement = (
  editor: MyEditor,
  entry: NodeEntry<DataViewElement>
): boolean => {
  const [node, path] = entry;

  if (!node.children) {
    setNodes(editor, { children: [{ text: '' }] }, { at: path });
    return true;
  }

  if (node.children.length < 1) {
    insertNodes<TableCaptionElement>(
      editor,
      [
        {
          id: nanoid(),
          type: ELEMENT_TABLE_CAPTION,
          children: [
            {
              id: nanoid(),
              type: ELEMENT_TABLE_VARIABLE_NAME,
              children: [{ text: '' }],
            },
          ],
        },
      ],
      { at: [...path, 0] }
    );
    return true;
  }
  if (node.children.length < 2) {
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
    return true;
  }

  if (node.children[0].type !== ELEMENT_TABLE_CAPTION) {
    removeNodes(editor, { at: [...path, 0] });
    return true;
  }

  if (node.children[1].type !== ELEMENT_DATA_VIEW_TR) {
    removeNodes(editor, { at: [...path, 1] });
    return true;
  }

  return false;
};

const normalizeDataViewHeaders = (
  editor: MyEditor,
  entry: NodeEntry<DataViewElement>
): boolean => {
  const [node, path] = entry;
  if (!node.children[1].children) {
    setNodes<DataViewHeaderRowElement>(editor, { children: [] }, { at: path });
    return true;
  }
  return true;
};

const normalizeDataViewPlugin =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): boolean => {
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
    acceptableElementProperties: ['expandedGroups', 'varName', 'color', 'icon'],
    acceptableSubElements: [ELEMENT_TABLE_CAPTION, ELEMENT_DATA_VIEW_TR],
    plugin: normalizeDataViewPlugin,
  });
