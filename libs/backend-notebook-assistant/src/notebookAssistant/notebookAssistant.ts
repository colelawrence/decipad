import { getNotebookContent } from '@decipad/backend-notebook-content';
import { debug } from '../debug';
import { suggestNewContentToFulfillRequest } from './suggestNewContentToFulfillRequest';
import { suggestEditorChanges } from './suggestEditorChanges';
import { fixElementIds } from '../utils/fixElementIds';
import { RootDocument } from '@decipad/editor-types';
import { encodeDocumentIds } from '../utils/encodeDocumentIds';
import cloneDeep from 'lodash.clonedeep';
import { fixDocument } from '../utils/fixDocument';
import { Subject, type Observable } from 'rxjs';
import { NotebookAssistantEvent, NotebookAssistantReply } from '../types';
import { TOperation } from '@udecode/plate';

const internalNotebookAssistant = (
  oldDocument: RootDocument,
  request: string,
  connectionId: string
): Observable<NotebookAssistantEvent> => {
  const events = new Subject<NotebookAssistantEvent>();
  try {
    events.next({ type: 'begin', connectionId });

    const [encodedOldDocument, decodeDocument] = encodeDocumentIds(oldDocument);
    events.subscribe((event) => {
      try {
        switch (event.type) {
          case 'new-doc': {
            const { newDoc: encodedNewDocument } = event;
            const newDocument = fixDocument(decodeDocument(encodedNewDocument));
            const operations = suggestEditorChanges(
              oldDocument,
              fixElementIds(cloneDeep(oldDocument), cloneDeep(newDocument))
            );
            events.next({ type: 'operations', operations });
            break;
          }
        }
      } catch (err) {
        events.next({
          type: 'error',
          message: (err as Error).message,
          error: err as Error,
        });
      }
    });

    suggestNewContentToFulfillRequest(
      cloneDeep(encodedOldDocument),
      request,
      events,
      connectionId
    ).catch((err) => {
      events.next({
        type: 'error',
        message: (err as Error).message,
        error: err as Error,
      });
    });
  } catch (err) {
    events.next({
      type: 'error',
      message: (err as Error).message,
      error: err as Error,
    });
  }

  setTimeout(() => events.next({ type: 'begin', connectionId }), 0);
  return events.asObservable();
};

export const streamingNotebookAssistant = async (
  notebookId: string,
  request: string,
  connectionId: string
): Promise<Observable<NotebookAssistantEvent>> => {
  debug('notebookAssistant', { notebookId, request, connectionId });
  const oldDocument = await getNotebookContent(notebookId);
  return internalNotebookAssistant(oldDocument, request, connectionId);
};

export const notebookAssistant = async (
  notebookId: string,
  request: string,
  connectionId: string
): Promise<NotebookAssistantReply> => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<NotebookAssistantReply>(async (resolve, reject) => {
    let operations: undefined | TOperation[];
    let summary: undefined | string;

    const subscription = (
      await streamingNotebookAssistant(notebookId, request, connectionId)
    ).subscribe((event) => {
      switch (event.type) {
        case 'error': {
          subscription.unsubscribe();
          reject(event.error);
          break;
        }
        case 'operations': {
          operations = event.operations;
          break;
        }
        case 'summary': {
          summary = event.summary;
          break;
        }
        case 'end': {
          subscription.unsubscribe();
          break;
        }
      }

      if (operations != null && summary != null) {
        resolve({ operations, summary });
      }
    });
  });
};
