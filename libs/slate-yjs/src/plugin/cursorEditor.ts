/* eslint-disable no-param-reassign */
import invariant from 'tiny-invariant';
import { Awareness } from 'y-protocols/awareness';
import debounce from 'lodash.debounce';
import { Session } from 'next-auth';
import { YjsEditor } from './yjsEditor';
import { jsonify } from '../utils/jsonify';
import { noop } from '@decipad/utils';

export interface CursorEditor extends YjsEditor {
  awareness: Awareness;
  destroy: () => void;
}

const AWARENESS: WeakMap<CursorEditor, Awareness> = new WeakMap();

const cursorChangeDebounceMs = 2_000;

export const CursorEditor = {
  awareness(editor: CursorEditor): Awareness {
    const awareness = AWARENESS.get(editor);
    invariant(awareness, 'CursorEditor without attached awareness');
    return awareness;
  },

  updateCursor: (editor: CursorEditor, session: Session | undefined): void => {
    try {
      const selection = editor.editorController.GetSelection();

      const { anchor } = selection ?? {};
      const { focus } = selection ?? {};

      const awareness = CursorEditor.awareness(editor);
      const localState = awareness.getLocalState();
      const { user } = session ?? {};
      const newState = {
        ...jsonify(localState),
        anchor,
        focus,
        user: user && {
          email: user.email,
          name: user.name,
        },
      };
      awareness.setLocalState(newState);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  },
};

export function withCursor(
  editor: YjsEditor,
  awareness: Awareness,
  getSession: () => Session | undefined
): CursorEditor {
  const cursorEditor: CursorEditor = {
    ...editor,
    awareness,
    destroy: noop,
  };

  AWARENESS.set(cursorEditor, awareness);

  const { onChange } = editor.editorController;
  const { destroy } = editor;

  const debouncedOnChange = debounce(() => {
    try {
      CursorEditor.updateCursor(cursorEditor, getSession());
    } catch (err) {
      // do nothing, not important
    }
  }, cursorChangeDebounceMs);

  editor.editorController.onChange = () => {
    debouncedOnChange();

    onChange.bind(editor.editorController)();
  };

  editor.destroy = () => {
    editor.editorController.onChange = onChange.bind(editor.editorController);
    destroy.call(cursorEditor);
  };

  return cursorEditor;
}
