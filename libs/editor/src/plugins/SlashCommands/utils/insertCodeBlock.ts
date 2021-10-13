import {
  insertEmptyCodeBlock,
  SPEditor,
  getPlatePluginType,
  ELEMENT_DEFAULT,
} from '@udecode/plate';

export const insertCodeBlock = (editorToFormat: SPEditor): void => {
  insertEmptyCodeBlock(editorToFormat, {
    defaultType: getPlatePluginType(editorToFormat, ELEMENT_DEFAULT),
    insertNodesOptions: { select: true },
  });
};
