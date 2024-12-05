import {
  createNormalizerPlugin,
  type NormalizerReturnValue,
} from '@decipad/editor-plugin-factories';
import {
  ELEMENT_TIME_SERIES,
  ELEMENT_TIME_SERIES_CAPTION,
  ELEMENT_TIME_SERIES_NAME,
  ELEMENT_TIME_SERIES_TR,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  type TimeSeriesCaptionElement,
  type TimeSeriesElement,
  type TimeSeriesHeaderRowElement,
  type TimeSeriesNameElement,
  type MyEditor,
  type MyNodeEntry,
  type TableColumnFormulaElement,
} from '@decipad/editor-types';
import { assertElementType, insertNodes } from '@decipad/editor-utils';
import {
  findNode,
  getChildren,
  isText,
  removeNodes,
  setNodes,
  wrapNodes,
} from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { type NodeEntry } from 'slate';

const normalizeTimeSeriesElement = (
  editor: MyEditor,
  entry: NodeEntry<TimeSeriesElement>
): NormalizerReturnValue => {
  const [node, path] = entry;

  if (!node.children) {
    return () => setNodes(editor, { children: [{ text: '' }] }, { at: path });
  }

  if (node.children.length < 1) {
    return () =>
      insertNodes<TimeSeriesCaptionElement>(
        editor,
        [
          {
            id: nanoid(),
            type: ELEMENT_TIME_SERIES_CAPTION,
            children: [
              {
                id: nanoid(),
                type: ELEMENT_TIME_SERIES_NAME,
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
      insertNodes<TimeSeriesHeaderRowElement>(
        editor,
        [
          {
            id: nanoid(),
            type: ELEMENT_TIME_SERIES_TR,
            children: [],
          },
        ],
        { at: [...path, 1] }
      );
  }

  if (node.children[0].type !== ELEMENT_TIME_SERIES_CAPTION) {
    return () =>
      setNodes(
        editor,
        { type: ELEMENT_TIME_SERIES_CAPTION },
        { at: [...path, 0] }
      );
  }

  if (node.children[0].children.length < 1) {
    return () =>
      insertNodes<TimeSeriesNameElement>(
        editor,
        [
          {
            id: nanoid(),
            type: ELEMENT_TIME_SERIES_NAME,
            children: [{ text: '' }],
          },
        ],
        { at: [...path, 0, 0] }
      );
  }
  if (node.children[0].children[0]?.type !== ELEMENT_TIME_SERIES_NAME) {
    const timeSeriesName = node.children[0].children[0];
    if (isText(timeSeriesName)) {
      return () =>
        wrapNodes(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_TIME_SERIES_NAME,
            children: [timeSeriesName],
          },
          { at: [...path, 0, 0] }
        );
    }
    return () =>
      setNodes(
        editor,
        { type: ELEMENT_TIME_SERIES_NAME },
        { at: [...path, 0, 0] }
      );
  }

  if (node.children[1].type !== ELEMENT_TIME_SERIES_TR) {
    return () => removeNodes(editor, { at: [...path, 1] });
  }

  return false;
};

const normalizeTimeSeriesHeaders = (
  editor: MyEditor,
  entry: NodeEntry<TimeSeriesElement>
): NormalizerReturnValue => {
  const [node, path] = entry;
  if (!node.children[1].children) {
    return () =>
      setNodes<TimeSeriesHeaderRowElement>(
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

const normalizeTimeSeriesPlugin =
  (editor: MyEditor) =>
  (entry: MyNodeEntry): NormalizerReturnValue => {
    const [node] = entry;
    assertElementType(node, ELEMENT_TIME_SERIES);
    return (
      normalizeTimeSeriesElement(
        editor,
        entry as NodeEntry<TimeSeriesElement>
      ) ||
      normalizeTimeSeriesHeaders(editor, entry as NodeEntry<TimeSeriesElement>)
    );
  };

export const createNormalizeTimeSeriesPlugin = () =>
  createNormalizerPlugin({
    name: 'PLUGIN_NORMALIZE_TIME_SERIES',
    elementType: ELEMENT_TIME_SERIES,
    acceptableElementProperties: [
      'expandedGroups',
      'varName',
      'color',
      'icon',
      'rotate',
      'alternateRotation',
      'schema',
    ],
    acceptableSubElements: [ELEMENT_TABLE_CAPTION, ELEMENT_TIME_SERIES_TR],
    plugin: normalizeTimeSeriesPlugin,
  });
