import {
  isHistoryEditor,
  TEditor,
  TOperation,
  withoutNormalizing,
  withoutSavingHistory,
} from '@udecode/plate';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { applyYjsEvents } from '../applyToSlate';
import applySlateOps from '../applyToYjs';
import { SharedType, slateYjsSymbol } from '../model';
import { toSlateDoc } from '../utils';

const IS_REMOTE: WeakSet<TEditor> = new WeakSet();
const LOCAL_OPERATIONS: WeakMap<TEditor, Set<TOperation>> = new WeakMap();
const SHARED_TYPES: WeakMap<TEditor, SharedType> = new WeakMap();

export interface YjsEditor extends TEditor {
  sharedType: SharedType;
  destroy: () => void;
  synchronizeValue: () => void;
}

export type WithYjsOptions = {
  synchronizeValue?: boolean;
};

export const YjsEditor = {
  /**
   * Set the editor value to the content of the to the editor bound shared type.
   */
  synchronizeValue: (e: YjsEditor): void => {
    withoutNormalizing(e, () => {
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
  asLocal: <T>(editor: YjsEditor, fn: () => T): T => {
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

function localOperations(editor: YjsEditor): Set<TOperation> {
  const operations = LOCAL_OPERATIONS.get(editor);
  invariant(operations, 'YjsEditor without attached local operations');
  return operations;
}

function trackLocalOperations(editor: YjsEditor, operation: TOperation): void {
  if (!YjsEditor.isRemote(editor)) {
    localOperations(editor).add(operation);
  }
}

/**
 * Applies a slate operations to the bound shared type.
 */
function applyLocalOperations(editor: YjsEditor): void {
  const ops = localOperations(editor);
  const editorLocalOperations = Array.from(ops).flat();

  applySlateOps(
    YjsEditor.sharedType(editor),
    editorLocalOperations,
    slateYjsSymbol
  );

  ops.clear();
}

/**
 * Apply Yjs events to slate
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yjsApply = (editor: YjsEditor, events: Y.YEvent<any>[]) =>
  withoutNormalizing(editor, () =>
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
    })
  );

function applyRemoteYjsEvents(
  _editor: YjsEditor,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: Y.YEvent<any>[]
): void {
  try {
    if (isHistoryEditor(_editor)) {
      withoutSavingHistory(_editor, () => {
        yjsApply(_editor, events);
      });
    } else {
      yjsApply(_editor, events);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error applying remote events', err, events);
  }
}

export function withYjs<T extends TEditor>(
  editor: T,
  sharedType: SharedType
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedType = sharedType;
  SHARED_TYPES.set(editor, sharedType);
  LOCAL_OPERATIONS.set(editor, new Set());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const observer = (events: Y.YEvent<any>[]) => applyRemoteYjsEvents(e, events);
  sharedType.observeDeep(observer);

  const { apply, onChange, destroy } = e;

  e.apply = (op: TOperation) => {
    trackLocalOperations(e, op);

    apply(op);
  };

  e.onChange = () => {
    applyLocalOperations(e);

    onChange();
  };

  e.destroy = () => {
    sharedType.unobserveDeep(observer);
    e.apply = apply;
    e.onChange = onChange;
    destroy.call(e);
  };

  e.synchronizeValue = () => {
    YjsEditor.synchronizeValue(e);
  };

  return e;
}
