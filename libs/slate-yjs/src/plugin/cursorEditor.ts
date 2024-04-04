/* eslint-disable no-param-reassign */
import invariant from 'tiny-invariant';
import { type Awareness } from 'y-protocols/awareness';
import debounce from 'lodash.debounce';
import { type Session } from 'next-auth';
import { jsonify } from '../utils/jsonify';
import type { MinimalRootEditor } from '@decipad/editor-types';
import type {
  TYjsEditor as GTYjsEditor,
  TCursorEditor as GTCursorEditor,
} from './types';

type TYjsEditor = GTYjsEditor<MinimalRootEditor>;
type TCursorEditor = GTCursorEditor<MinimalRootEditor>;

const AWARENESS: WeakMap<TCursorEditor, Awareness> = new WeakMap();

const cursorChangeDebounceMs = 2_000;

export const CursorEditor = {
  awareness(editor: TCursorEditor): Awareness {
    const awareness = AWARENESS.get(editor);
    invariant(awareness, 'CursorEditor without attached awareness');
    return awareness;
  },

  updateCursor: (editor: TCursorEditor, session: Session | undefined): void => {
    try {
      const { selection } = editor;

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
  editor: TYjsEditor,
  awareness: Awareness,
  getSession: () => Session | undefined
): TCursorEditor {
  const { onChange, destroy } = editor;

  const debouncedOnChange = debounce(() => {
    try {
      CursorEditor.updateCursor(
        editor as unknown as TCursorEditor,
        getSession()
      );
    } catch (err) {
      // do nothing, not important
    }
  }, cursorChangeDebounceMs);

  editor.onChange = () => {
    debouncedOnChange();

    onChange.bind(editor)();
  };

  editor.destroy = () => {
    editor.onChange = onChange.bind(editor);
    destroy.call(editor);
  };

  const cursorEditor = editor as unknown as TCursorEditor;

  cursorEditor.awareness = awareness;
  AWARENESS.set(cursorEditor, awareness);

  return cursorEditor;
}
