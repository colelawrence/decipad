import {
  autoformatBlock,
  ELEMENT_CODE_BLOCK,
  ELEMENT_TABLE,
  PlatePluginKey,
  SPEditor,
  TEditor,
  unwrapList,
} from '@udecode/plate';
import { Location } from 'slate';
import { formatCodeBlock } from './formatCodeBlock';
import { formatTable } from './formatTable';

export const insertBlock = (
  editor: SPEditor,
  at: Location,
  { pluginKey = ELEMENT_CODE_BLOCK }: PlatePluginKey
): void => {
  const preFormat = (editorToFormat: TEditor) =>
    unwrapList(editorToFormat as SPEditor);

  autoformatBlock(editor, pluginKey, at, {
    preFormat,
    format: () => {
      if (pluginKey === ELEMENT_CODE_BLOCK) {
        formatCodeBlock(editor);
      }
      if (pluginKey === ELEMENT_TABLE) {
        formatTable(editor, at);
      }
    },
  });
};
