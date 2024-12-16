import {
  createNormalizerPlugin,
  type NormalizerReturnValue,
} from '@decipad/editor-plugin-factories';
import {
  ELEMENT_TIME_SERIES,
  ELEMENT_TIME_SERIES_TR,
  ELEMENT_TABLE_CAPTION,
  type TimeSeriesElement,
  type TimeSeriesHeaderRowElement,
  type MyEditor,
  type MyNodeEntry,
  DataViewCaptionElement,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
  DataViewNameElement,
} from '@decipad/editor-types';
import { assertElementType, insertNodes } from '@decipad/editor-utils';
import {
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
        [
          {
            id: nanoid(),
            type: ELEMENT_DATA_VIEW_NAME,
            children: [{ text: '' }],
          },
        ],
        { at: [...path, 0, 0] }
      );
  }
  if (node.children[0].children[0]?.type !== ELEMENT_DATA_VIEW_NAME) {
    const timeSeriesName = node.children[0].children[0];
    if (isText(timeSeriesName)) {
      return () =>
        wrapNodes(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_DATA_VIEW_NAME,
            children: [timeSeriesName],
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
    acceptableElementProperties: ['varName', 'color', 'icon', 'schema'],
    acceptableSubElements: [ELEMENT_TABLE_CAPTION, ELEMENT_TIME_SERIES_TR],
    plugin: normalizeTimeSeriesPlugin,
  });
