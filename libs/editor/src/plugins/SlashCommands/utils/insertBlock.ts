import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_DEFAULT,
  getPlatePluginType,
  insertEmptyCodeBlock,
  PlatePluginKey,
  setNodes,
  SPEditor,
  TEditor,
  TElement,
  unwrapList,
} from '@udecode/plate';
import { Editor, Location, Transforms } from 'slate';
import { TABLE_INPUT } from '../../../utils/elementTypes';
import { formatTable } from './formatTable';

export const insertBlock = (
  editor: SPEditor,
  at: Location,
  { pluginKey = ELEMENT_CODE_BLOCK }: PlatePluginKey
): void => {
  const formatCodeBlock = (editorToFormat: TEditor) => {
    insertEmptyCodeBlock(editorToFormat as SPEditor, {
      defaultType: getPlatePluginType(
        editorToFormat as SPEditor,
        ELEMENT_DEFAULT
      ),
      insertNodesOptions: { select: true },
    });
  };

  Transforms.delete(editor, { at });
  unwrapList(editor);

  if (pluginKey === ELEMENT_CODE_BLOCK) {
    formatCodeBlock(editor);
  } else if (pluginKey === TABLE_INPUT) {
    formatTable(editor);
  } else {
    setNodes<TElement>(
      editor,
      { type: pluginKey },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  }
};
