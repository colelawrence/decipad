import { applyYjsEvents, translateYjsEvent } from './applyToSlate';
import applySlateOps from './applyToYjs';
import { SyncElement, SyncNode, SharedType } from './model';
import {
  CursorEditor,
  useCursors,
  withCursor,
  withYjs,
  YjsEditor,
} from './plugin';
import { toSharedType, toSlateDoc, toSyncElement } from './utils';

export {
  CursorEditor,
  SyncElement,
  SyncNode,
  useCursors,
  withCursor,
  withYjs,
  YjsEditor,
  toSharedType,
  toSlateDoc,
  toSyncElement,
  translateYjsEvent,
  applyYjsEvents,
  applySlateOps,
};

export type { SharedType };
