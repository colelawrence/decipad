import {
  autoformatBlock,
  ELEMENT_CODE_BLOCK,
  getPlatePluginType,
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
) => {
  const node = {
    type: getPlatePluginType(editor, pluginKey),
    children: [{ text: '' }],
  };
  autoformatBlock(editor, node.type, at, {
    preFormat: (editor: TEditor) => unwrapList(editor as SPEditor),
  });
};
