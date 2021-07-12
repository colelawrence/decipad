import {
  autoformatBlock,
  ELEMENT_CODE_BLOCK,
  getSlatePluginType,
  SlatePluginKey,
  SPEditor,
  TEditor,
  unwrapList,
} from '@udecode/slate-plugins';
import { Location } from 'slate';

export const insertBlock = (
  editor: SPEditor,
  at: Location,
  { pluginKey = ELEMENT_CODE_BLOCK }: SlatePluginKey
) => {
  const node = {
    type: getSlatePluginType(editor, pluginKey),
    children: [{ text: '' }],
  };
  autoformatBlock(editor, node.type, at, {
    preFormat: (editor: TEditor) => unwrapList(editor as SPEditor),
  });
};
