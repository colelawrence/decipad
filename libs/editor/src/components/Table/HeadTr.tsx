import { HeadTrElement } from '@decipad/ui';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  getAbove,
  insertNodes,
  PlatePluginComponent,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate';
import { Editor, NodeEntry } from 'slate';
import { InteractiveTable } from '../../plugins/InteractiveTable/table';

// TODO should work without focus
export const addColumn = (editor: Editor): void => {
  const table = getAbove(editor, {
    match: { type: ELEMENT_TABLE },
  });
  if (table) {
    const [tableNode, tablePath] = table as NodeEntry<InteractiveTable>;
    const [, tableHead, tableBody] = tableNode.children;
    const headPath = [...tablePath, 1];
    const bodyPath = [...tablePath, 2];

    const headRowNodes = tableHead.children;
    headRowNodes.forEach((rowNode, rowIndex) => {
      const rowPath = [...headPath, rowIndex];
      const numberOfCells = rowNode.children.length;
      const insertPath = [...rowPath, numberOfCells];
      insertNodes(
        editor,
        {
          type: ELEMENT_TH,
          // TODO Column default name
          children: [{ text: '' }],
        },
        { at: insertPath, select: true }
      );
    });

    const bodyRowNodes = tableBody.children;
    bodyRowNodes.forEach((rowNode, rowIndex) => {
      const rowPath = [...bodyPath, rowIndex];
      const numberOfCells = rowNode.children.length;
      const insertPath = [...rowPath, numberOfCells];
      insertNodes(
        editor,
        {
          type: ELEMENT_TD,
          children: [{ text: '' }],
        },
        { at: insertPath }
      );
    });
  }
};

export const HeadTr: PlatePluginComponent = (props) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));
  if (!editor) {
    throw new Error('missing editor');
  }

  return <HeadTrElement {...props} onAddColumn={() => addColumn(editor)} />;
};
