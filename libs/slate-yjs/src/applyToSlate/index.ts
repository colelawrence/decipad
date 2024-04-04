/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TOperation } from '@udecode/plate-common';
import * as Y from 'yjs';
import { captureException } from '@sentry/browser';
import type { MinimalRootEditor } from '@decipad/editor-types';
import translateArrayEvent from './arrayEvent';
import translateMapEvent from './mapEvent';
import translateTextEvent from './textEvent';

/**
 * Translates a Yjs event into slate editor operations.
 *
 * @param event
 */
export function translateYjsEvent(
  editor: MinimalRootEditor,
  event: Y.YEvent<any>
): TOperation[] {
  if (event instanceof Y.YArrayEvent) {
    return translateArrayEvent(editor, event);
  }

  if (event instanceof Y.YMapEvent) {
    return translateMapEvent(editor, event);
  }

  if (event instanceof Y.YTextEvent) {
    return translateTextEvent(editor, event);
  }

  throw new Error('Unsupported yjs event');
}

/**
 * Applies multiple yjs events to a slate editor.
 */
export function applyYjsEvents(
  editor: MinimalRootEditor,
  events: Y.YEvent<any>[]
): void {
  editor.withoutNormalizing(() => {
    events.forEach((event) => {
      try {
        // change here probs
        translateYjsEvent(editor, event).forEach(editor.apply.bind(editor));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error applying yjs event', event, err);
        captureException(err);
      }
    });
  });
}
