import { Editor } from 'slate';
import invariant from 'tiny-invariant';
import { Awareness } from 'y-protocols/awareness';
import { absolutePositionToRelativePosition } from '../cursor/utils';
import { YjsEditor } from './yjsEditor';

const AWARENESS: WeakMap<Editor, Awareness> = new WeakMap();

export interface CursorEditor extends YjsEditor {
  awareness: Awareness;
  setReady: (ready: boolean) => void;
}

export const CursorEditor = {
  awareness(editor: CursorEditor): Awareness {
    const awareness = AWARENESS.get(editor);
    invariant(awareness, 'CursorEditor without attaches awareness');
    return awareness;
  },

  updateCursor: (editor: CursorEditor): void => {
    const sharedType = YjsEditor.sharedType(editor);
    const { selection } = editor;

    const anchor =
      selection &&
      absolutePositionToRelativePosition(sharedType, selection.anchor);

    const focus =
      selection &&
      absolutePositionToRelativePosition(sharedType, selection.focus);

    const awareness = CursorEditor.awareness(editor);
    awareness.setLocalState({ ...awareness.getLocalState(), anchor, focus });
  },
};

export function withCursor<T extends YjsEditor>(
  editor: T,
  awareness: Awareness
): T & CursorEditor {
  let ready = false;
  const e = editor as T & CursorEditor;

  AWARENESS.set(e, awareness);
  e.awareness = awareness;

  const { onChange } = editor;

  e.onChange = () => {
    if (ready) {
      // only do stuff if the editor is loaded and ready
      setTimeout(() => CursorEditor.updateCursor(e), 0);
    }

    if (onChange) {
      onChange();
    }
  };

  e.setReady = (_ready: boolean) => {
    ready = _ready;
  };

  return e;
}
