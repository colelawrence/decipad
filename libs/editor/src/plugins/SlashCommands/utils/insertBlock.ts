import {
  autoformatBlock,
  ELEMENT_CODE_BLOCK,
  ELEMENT_DEFAULT,
  getPlatePluginType,
  insertEmptyCodeBlock,
  PlatePluginKey,
  SPEditor,
  TEditor,
  unwrapList,
} from '@udecode/plate';
import { Location } from 'slate';

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

  const preFormat = (editorToFormat: TEditor) =>
    unwrapList(editorToFormat as SPEditor);

  autoformatBlock(editor, pluginKey, at, {
    preFormat,
    format: pluginKey === ELEMENT_CODE_BLOCK ? formatCodeBlock : undefined,
  });
};
