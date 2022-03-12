import type { Editor } from '@decipad/editor-types';
import { Editor as SlateEditor, Operation } from 'slate';
import { HistoryEditor } from 'slate-history';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { applyYjsEvents } from '../applyToSlate';
import applySlateOps from '../applyToYjs';
import { SharedType, slateYjsSymbol } from '../model';
import { toSlateDoc } from '../utils';

const IS_REMOTE: WeakSet<Editor> = new WeakSet();
const LOCAL_OPERATIONS: WeakMap<Editor, Set<Operation>> = new WeakMap();
const SHARED_TYPES: WeakMap<Editor, SharedType> = new WeakMap();

export interface YjsEditor extends Editor {
  sharedType: SharedType;
  onChange: SlateEditor['onChange'];
  apply: SlateEditor['apply'];
}

export type WithYjsOptions = {
  synchronizeValue?: boolean;
};

export const YjsEditor = {
  /**
   * Set the editor value to the content of the to the editor bound shared type.
   */
  synchronizeValue: (e: YjsEditor): void => {
    SlateEditor.withoutNormalizing(e as unknown as SlateEditor, () => {
      e.children = toSlateDoc(e.sharedType) as YjsEditor['children'];
      e.onChange();
    });
  },

  /**
   * Returns whether the editor currently is applying remote changes.
   */
  sharedType: (editor: YjsEditor): SharedType => {
    const sharedType = SHARED_TYPES.get(editor);
    invariant(sharedType, 'YjsEditor without attached shared type');
    return sharedType;
  },

  /**
   * Returns whether the editor currently is applying remote changes.
   */
  isRemote: (editor: YjsEditor): boolean => {
    return IS_REMOTE.has(editor);
  },

  /**
   * Performs an action as a remote operation.
   */
  asRemote: (editor: YjsEditor, fn: () => void): void => {
    const wasRemote = YjsEditor.isRemote(editor);
    IS_REMOTE.add(editor);

    fn();

    if (!wasRemote) {
      IS_REMOTE.delete(editor);
    }
  },
};

function localOperations(editor: YjsEditor): Set<Operation> {
  const operations = LOCAL_OPERATIONS.get(editor);
  invariant(operations, 'YjsEditor without attached local operations');
  return operations;
}

function trackLocalOperations(editor: YjsEditor, operation: Operation): void {
  if (!YjsEditor.isRemote(editor)) {
    localOperations(editor).add(operation);
  }
}

/**
 * Applies a slate operations to the bound shared type.
 */
function applyLocalOperations(editor: YjsEditor): void {
  const editorLocalOperations = localOperations(editor);

  applySlateOps(
    YjsEditor.sharedType(editor),
    Array.from(editorLocalOperations),
    slateYjsSymbol
  );

  editorLocalOperations.clear();
}

/**
 * Apply Yjs events to slate
 */

const yjsApply = (editor: YjsEditor, events: Y.YEvent[]) =>
  SlateEditor.withoutNormalizing(editor as unknown as SlateEditor, () =>
    YjsEditor.asRemote(editor, () => {
      try {
        applyYjsEvents(
          editor,
          events.filter((event) => event.transaction.origin !== slateYjsSymbol)
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error applying remote event', err);
        throw err;
      }
    })
  );

function applyRemoteYjsEvents(_editor: YjsEditor, events: Y.YEvent[]): void {
  if (HistoryEditor.isHistoryEditor(_editor)) {
    HistoryEditor.withoutSaving(_editor, () => {
      yjsApply(_editor, events);
    });
  } else {
    yjsApply(_editor, events);
  }
}

export function withYjs<T extends Editor>(
  editor: T,
  sharedType: SharedType,
  { synchronizeValue = true }: WithYjsOptions = {}
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedType = sharedType;
  SHARED_TYPES.set(editor, sharedType);
  LOCAL_OPERATIONS.set(editor, new Set());

  if (synchronizeValue) {
    setTimeout(() => YjsEditor.synchronizeValue(e), 0);
  }

  sharedType.observeDeep((events) => applyRemoteYjsEvents(e, events));

  const { apply, onChange } = e;

  e.apply = (op: Operation) => {
    trackLocalOperations(e, op);

    try {
      apply(op);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error applying op', op);
      throw err;
    }
  };

  e.onChange = () => {
    applyLocalOperations(e);

    onChange();
  };

  return e;
}
