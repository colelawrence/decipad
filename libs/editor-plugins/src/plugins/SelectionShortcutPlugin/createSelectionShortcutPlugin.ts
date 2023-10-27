import {
  ENode,
  TEditor,
  Value,
  getNodeEntries,
  getRange,
  isBlock,
} from '@udecode/plate';
import { Location, Range } from 'slate';
import { setSelection } from '@decipad/editor-utils';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';

const getEntries = <TV extends Value, TE extends TEditor<TV>>(
  editor: TE,
  at: Location
) => {
  const entriesGen = getNodeEntries<ENode<TV>, TV>(editor, {
    at,
    voids: true,
    match: (n) => isBlock(editor, n),
  });

  const entries = [];
  for (const entry of entriesGen) {
    entries.push(entry);
  }
  return entries;
};

export const createSelectionShortcutPlugin = createOnKeyDownPluginFactory({
  name: 'SELECTION_SHORTCUT_PLUGIN',
  plugin: (editor) => (event) => {
    const { selection } = editor;

    if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
      if (!selection) {
        // The cursor is not on any node inside the editor, select everything.
        return;
      }

      const entries = getEntries(editor, selection);
      if (entries.length !== 1) {
        // The selection spans multiple nodes, select everything.
        return;
      }

      const range = getRange(editor, entries[0][1]);

      if (Range.equals(selection, range)) {
        // The node is already selected, select everything.
        return;
      }

      setSelection(editor, range);

      event.preventDefault();
    }
  },
});
