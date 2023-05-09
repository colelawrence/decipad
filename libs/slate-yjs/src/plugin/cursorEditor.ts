import { TEditor } from '@udecode/plate';
import invariant from 'tiny-invariant';
import { Awareness } from 'y-protocols/awareness';
import { debounce } from 'lodash';
import { Session } from 'next-auth';
import { YjsEditor } from './yjsEditor';
import { jsonify } from '../utils/jsonify';

const AWARENESS: WeakMap<TEditor, Awareness> = new WeakMap();

const cursorChangeDebounceMs = 2_000;

export interface CursorEditor extends YjsEditor {
  awareness: Awareness;
  destroy: () => void;
}

export const CursorEditor = {
  awareness(editor: CursorEditor): Awareness {
    const awareness = AWARENESS.get(editor);
    invariant(awareness, 'CursorEditor without attaches awareness');
    return awareness;
  },

  updateCursor: (editor: CursorEditor, session: Session | undefined): void => {
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

export function withCursor<T extends YjsEditor>(
  editor: T,
  awareness: Awareness,
  getSession: () => Session | undefined
): T & CursorEditor {
  const e = editor as T & CursorEditor;

  AWARENESS.set(e, awareness);
  e.awareness = awareness;

  const { onChange, destroy } = editor;

  const debouncedOnChange = debounce(() => {
    try {
      CursorEditor.updateCursor(e, getSession());
    } catch (err) {
      // do nothing, not important
    }
  }, cursorChangeDebounceMs);

  e.onChange = () => {
    debouncedOnChange();

    onChange();
  };

  e.destroy = () => {
    e.onChange = onChange;
    destroy.call(e);
  };

  return e;
}
