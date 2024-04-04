/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import type { TOperation } from '@udecode/plate-common';
import { isHistoryEditor, withoutSavingHistory } from '@udecode/plate-common';
import invariant from 'tiny-invariant';
import type * as Y from 'yjs';
import type { MinimalRootEditor } from '@decipad/editor-types';
import type { TYjsEditor } from './types';
import { applyYjsEvents } from '../applyToSlate';
import applySlateOps from '../applyToYjs';
import type { SharedType } from '../model';
import { slateYjsSymbol } from '../model';

const IS_REMOTE: WeakSet<MinimalRootEditor> = new WeakSet();
const LOCAL_OPERATIONS: WeakMap<
  MinimalRootEditor,
  Set<TOperation>
> = new WeakMap();
const SHARED_TYPES: WeakMap<MinimalRootEditor, SharedType> = new WeakMap();

export const YjsEditor = {
  /**
   * Returns whether the editor currently is applying remote changes.
   */
  sharedType: (editor: MinimalRootEditor): SharedType => {
    const sharedType = SHARED_TYPES.get(editor);
    invariant(sharedType, 'YjsEditor without attached shared type');
    return sharedType;
  },

  /**
   * Returns whether the editor currently is applying remote changes.
   */
  isRemote: (editor: MinimalRootEditor): boolean => {
    return IS_REMOTE.has(editor);
  },

  /**
   * Performs an action as a remote operation.
   */
  asRemote: (editor: MinimalRootEditor, fn: () => void): void => {
    const wasRemote = YjsEditor.isRemote(editor);
    IS_REMOTE.add(editor);

    fn();

    if (!wasRemote) {
      IS_REMOTE.delete(editor);
    }
  },
  asLocal: <T>(editor: MinimalRootEditor, fn: () => T): T => {
    const wasRemote = YjsEditor.isRemote(editor);
    if (wasRemote) {
      IS_REMOTE.delete(editor);
    }

    const ret = fn();

    if (wasRemote) {
      IS_REMOTE.add(editor);
    }

    return ret;
  },
};

function localOperations(editor: MinimalRootEditor): Set<TOperation> {
  const operations = LOCAL_OPERATIONS.get(editor);
  invariant(operations, 'YjsEditor without attached local operations');
  return operations;
}

function trackLocalOperations(
  editor: MinimalRootEditor,
  operation: TOperation
): void {
  if (!YjsEditor.isRemote(editor)) {
    localOperations(editor).add(operation);
  }
}

/**
 * Applies a slate operations to the bound shared type.
 */
function applyLocalOperations(editor: MinimalRootEditor): void {
  const ops = localOperations(editor);
  const editorLocalOperations = Array.from(ops).flat();

  try {
    applySlateOps(
      YjsEditor.sharedType(editor),
      editorLocalOperations,
      slateYjsSymbol
    );
  } finally {
    ops.clear();
  }
}

/**
 * Apply Yjs events to slate
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yjsApply = (editor: MinimalRootEditor, events: Y.YEvent<any>[]) =>
  YjsEditor.asRemote(editor, () => {
    try {
      applyYjsEvents(
        editor,
        events.filter((event) => event.transaction?.origin !== slateYjsSymbol)
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error applying remote event', err);
      throw err;
    }
  });

function applyRemoteYjsEvents(
  editor: MinimalRootEditor,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: Y.YEvent<any>[]
): void {
  try {
    editor.withoutNormalizing(() => {
      if (isHistoryEditor(editor)) {
        withoutSavingHistory(editor, () => {
          yjsApply(editor, events);
        });
      } else {
        yjsApply(editor, events);
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error applying remote events', err, events);
  }
}

export function withYjs<TEditor extends MinimalRootEditor>(
  editor: TEditor,
  sharedType: SharedType
): TYjsEditor<TEditor> {
  SHARED_TYPES.set(editor, sharedType);
  LOCAL_OPERATIONS.set(editor, new Set());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const observer = (events: Y.YEvent<any>[]) =>
    applyRemoteYjsEvents(editor, events);
  sharedType.observeDeep(observer);

  const { apply: _apply, onChange: _onChange } = editor;
  const apply = _apply.bind(editor);
  const onChange = _onChange.bind(editor);

  editor.apply = (op) => {
    trackLocalOperations(editor, op);
    apply(op);
  };

  editor.onChange = () => {
    applyLocalOperations(editor);
    onChange();
  };

  editor.destroy = () => {
    editor.apply = _apply;
    editor.onChange = _onChange;

    sharedType.unobserveDeep(observer);
  };

  (editor as TYjsEditor<TEditor>).sharedType = sharedType;

  return editor as TYjsEditor<TEditor>;
}
