/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { noop } from '@decipad/utils';
import {
  isHistoryEditor,
  TOperation,
  withoutSavingHistory,
} from '@udecode/plate';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { applyYjsEvents } from '../applyToSlate';
import applySlateOps from '../applyToYjs';
import { SharedType, slateYjsSymbol } from '../model';
import type { EditorController } from '@decipad/notebook-tabs';

export interface YjsEditor {
  editorController: EditorController;
  sharedType: SharedType;
  destroy: () => void;
}

const IS_REMOTE: WeakSet<YjsEditor> = new WeakSet();
const LOCAL_OPERATIONS: WeakMap<YjsEditor, Set<TOperation>> = new WeakMap();
const SHARED_TYPES: WeakMap<YjsEditor, SharedType> = new WeakMap();

export const YjsEditor = {
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
const yjsApply = (editor: YjsEditor, events: Y.YEvent<any>[]) =>
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

export function withYjs(
  editorController: EditorController,
  sharedType: SharedType
): YjsEditor {
  const yjs: YjsEditor = {
    editorController,
    sharedType,
    destroy: noop,
  };

  SHARED_TYPES.set(yjs, sharedType);
  LOCAL_OPERATIONS.set(yjs, new Set());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const observer = (events: Y.YEvent<any>[]) =>
    applyRemoteYjsEvents(yjs, events);
  sharedType.observeDeep(observer);

  const { apply, onChange } = editorController;

  editorController.apply = (op) => {
    trackLocalOperations(yjs, op);
    apply.bind(editorController)(op);
  };

  editorController.onChange = () => {
    applyLocalOperations(yjs);
    onChange.bind(editorController)();
  };

  yjs.destroy = () => {
    editorController.apply = apply;
    editorController.onChange = onChange;

    sharedType.unobserveDeep(observer);
  };

  return yjs;
}
