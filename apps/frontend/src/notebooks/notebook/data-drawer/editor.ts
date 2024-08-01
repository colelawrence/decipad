import { Computer } from '@decipad/computer-interfaces';
import {
  createAutoCompleteMenuPlugin,
  createSmartRefPlugin,
} from '@decipad/editor-plugins';
import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
} from '@decipad/editor-types';
import { decorateCode } from '@decipad/editor-utils';
import {
  PlateEditor,
  PlatePlugin,
  createPlateEditor,
} from '@udecode/plate-common';
import { DataDrawerEditingComponent } from './editor-components';
import { DataDrawerEditorValue } from './types';
import { createCodeLineV2Normalizers } from '@decipad/editor-plugin-factories';

const createDataDrawerInputPlugin = (computer: Computer): PlatePlugin => ({
  key: 'cell-editor-input',
  decorate: decorateCode(computer, ELEMENT_CODE_LINE_V2_CODE),
});

const createCodeLineRootPlugin = (): PlatePlugin => ({
  key: ELEMENT_CODE_LINE_V2,
  isElement: true,
  component: DataDrawerEditingComponent,
});

export const createDataDrawerEditor = (
  computer: Computer
): PlateEditor<DataDrawerEditorValue> => {
  const plugins = [createDataDrawerInputPlugin(computer)];

  plugins.push(
    createAutoCompleteMenuPlugin({
      options: {
        mode: 'tableCell',
      },
    })
  );

  plugins.push(createSmartRefPlugin());
  plugins.push(createCodeLineV2Normalizers(computer) as PlatePlugin);

  plugins.push(createCodeLineRootPlugin());

  const editor = createPlateEditor<
    DataDrawerEditorValue,
    PlateEditor<DataDrawerEditorValue>
  >({
    plugins,
  });

  return editor;
};
