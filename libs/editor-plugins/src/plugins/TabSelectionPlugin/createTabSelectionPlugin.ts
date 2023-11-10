import {
  ENode,
  TNodeEntry,
  getNextNode,
  getPreviousNode,
  getStartPoint,
} from '@udecode/plate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';
import { MyValue } from '@decipad/editor-types';

export const createTabSelectionPlugin = createOnKeyDownPluginFactory({
  name: 'TAB_INDEX_PLUGIN',
  plugin: (editor) => (event) => {
    const { selection } = editor;
    let nextNode: TNodeEntry<ENode<MyValue>> | undefined;

    if (!event.shiftKey && event.key === 'Tab') {
      nextNode = getNextNode(editor, {
        at: [selection?.anchor.path[0] ?? 0],
      });
    } else if (event.shiftKey && event.key === 'Tab') {
      nextNode = getPreviousNode(editor, {
        at: [selection?.anchor.path[0] ?? 0],
      });
    }

    if (!nextNode) return;
    event.preventDefault();
    const [, path] = nextNode;
    editor.setSelection({
      anchor: getStartPoint(editor, path),
      focus: getStartPoint(editor, path),
    });
  },
});
