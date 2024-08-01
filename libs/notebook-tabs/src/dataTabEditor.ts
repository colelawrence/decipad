import { DataTabValue, ELEMENT_DATA_TAB_CHILDREN } from '@decipad/editor-types';
import {
  PlateEditor,
  PlatePlugin,
  createPlateEditor,
  isEditor,
  removeNodes,
} from '@udecode/plate-common';
import {
  createNormalizerPluginFactory,
  createCodeLineV2NoUiPlugin,
} from '@decipad/editor-plugin-factories';
import { getComputer } from '@decipad/computer';

const dataTabStructureNormalizer = createNormalizerPluginFactory<
  DataTabValue,
  PlateEditor<DataTabValue>
>({
  name: 'DATA_TAB_EDITOR_NORMALIZER',
  plugin:
    (editor) =>
    ([node]) => {
      if (!isEditor(node)) {
        return false;
      }

      for (const [index, child] of editor.children.entries()) {
        if (child.type !== ELEMENT_DATA_TAB_CHILDREN) {
          return () => {
            removeNodes(editor, { at: [index] });
          };
        }
      }

      return false;
    },
});

export const createDataTabEditor = () => {
  return createPlateEditor<DataTabValue>({
    plugins: [
      dataTabStructureNormalizer(),
      createCodeLineV2NoUiPlugin(getComputer()) as PlatePlugin,
    ],
  });
};
