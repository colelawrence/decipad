import { applyYjsEvents, translateYjsEvent } from './applyToSlate';
import applySlateOps from './applyToYjs';
import { SyncElement, SyncNode, SharedType } from './model';
import {
  type TCursorEditor,
  withCursor,
  withYjs,
  type TYjsEditor,
} from './plugin';
import {
  toSharedType,
  toSharedTypeSingular,
  toSlateDoc,
  toSyncElement,
} from './utils';

export {
  TCursorEditor,
  SyncElement,
  SyncNode,
  withCursor,
  withYjs,
  TYjsEditor,
  toSharedType,
  toSlateDoc,
  toSyncElement,
  toSharedTypeSingular,
  translateYjsEvent,
  applyYjsEvents,
  applySlateOps,
};

export type { SharedType };
