import type { KeyboardEvent } from 'react';
import type { MyEditor, MyElementEntry } from './nodes';

export type EventInterceptor = (
  editor: MyEditor,
  target: MyElementEntry,
  ev: InterceptableEvent
) => boolean;

export type InterceptableEvent =
  | { type: 'delete-text-start'; event: KeyboardEvent }
  | { type: 'delete-text-end'; event: KeyboardEvent }
  | { type: 'delete-block'; event: KeyboardEvent };
