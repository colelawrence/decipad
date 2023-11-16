/* eslint-disable @typescript-eslint/no-explicit-any */
import { TOperation } from '@udecode/plate';
import * as Y from 'yjs';
import { YjsEditor } from '@decipad/slate-yjs';
import { captureException } from '@sentry/browser';
import translateArrayEvent from './arrayEvent';
import translateMapEvent from './mapEvent';
import translateTextEvent from './textEvent';

/**
 * Translates a Yjs event into slate editor operations.
 *
 * @param event
 */
export function translateYjsEvent(
  editor: YjsEditor,
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
  editor: YjsEditor,
  events: Y.YEvent<any>[]
): void {
  events.forEach((event) => {
    try {
      // change here probs
      translateYjsEvent(editor, event).forEach(editor.editorController.apply);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error applying yjs event', event, err);
      captureException(err);
    }
  });
}
