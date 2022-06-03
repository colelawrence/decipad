import { createTPluginFactory, MyEditor } from '@decipad/editor-types';
import { Path } from 'slate';
import { focusAndSetSelection, pluginStore } from '@decipad/editor-utils';
import { hasNode } from '@udecode/plate';

type FocusTargetFn = () => Path | null;

interface FocusTarget {
  getPath?: FocusTargetFn;
}

const PLUGIN_KEY = 'CURSOR_FOCUS_PLUGIN';

export const createCursorFocusPlugin = createTPluginFactory({
  key: PLUGIN_KEY,
  withOverrides: (editor) => {
    const { onChange } = editor;

    const target = pluginStore<FocusTarget>(editor, PLUGIN_KEY, () => ({}));
    const focus = () => {
      const path = target.getPath?.();

      if (!path) return;
      if (!hasNode(editor, path)) return;

      focusAndSetSelection(editor, path);
    };

    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      try {
        focus();
      } finally {
        delete target.getPath;
        onChange();
      }
    };

    return editor;
  },
});

export const focusCursorOnPath = (editor: MyEditor, getPath: FocusTargetFn) => {
  const target = pluginStore<FocusTarget>(editor, PLUGIN_KEY, () => ({}));

  target.getPath = getPath;
};
