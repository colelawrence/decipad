import {
  ELEMENT_DEFAULT,
  getPlatePluginType,
  insertEmptyCodeBlock,
  SPEditor,
} from '@udecode/plate';

export const formatCodeBlock = (editor: SPEditor): void => {
  insertEmptyCodeBlock(editor, {
    defaultType: getPlatePluginType(editor, ELEMENT_DEFAULT),
    insertNodesOptions: { select: true },
  });
};
