import { ELEMENT_CODE_LINE, MyEditor } from '@decipad/editor-types';
import { getParentNode } from '@udecode/plate';
import { isElementOfType } from '@decipad/editor-utils';
import { Range } from 'slate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';

export const createTabIndentPlugin = createOnKeyDownPluginFactory({
  name: 'INDENT_ON_TAB',
  plugin: (editor: MyEditor) => (event) => {
    const { selection } = editor;
    if (!selection) return;

    const cursor = Range.start(selection);
    const parentNode = getParentNode(editor, cursor);

    if (!parentNode) return;
    const [node] = parentNode;

    if (isElementOfType(node, ELEMENT_CODE_LINE) && event.key === 'Tab') {
      event.preventDefault();
      editor.insertText('\t');
    }
  },
});
