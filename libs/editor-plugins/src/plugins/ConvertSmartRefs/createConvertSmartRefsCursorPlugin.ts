import {
  convertCodeSmartRefs,
  getAboveNodeSafe,
  isElementOfType,
} from '@decipad/editor-utils';
import { Computer } from '@decipad/computer';
import { MyElement } from '@decipad/editor-types';
import { BaseSelection } from 'slate';
import { createOnCursorChangePluginFactory } from '../../pluginFactories';

export const createConvertSmartRefsCursorPlugin = (
  computer: Computer,
  elementTypes: MyElement['type'][]
) => {
  const plugin = createOnCursorChangePluginFactory(
    'SMART_REFS_CURSOR_PLUGIN',
    (editor, comp) => (selection: BaseSelection) => {
      if (!comp || !selection) return;

      const codeLine = getAboveNodeSafe(editor, {
        at: selection.anchor.path,
        match: (n) => elementTypes.some((eT) => isElementOfType(n, eT)),
      });
      if (!codeLine) return;
      convertCodeSmartRefs(editor, codeLine[1], comp);
    },
    computer
  );
  return plugin();
};
