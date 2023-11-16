/* eslint-disable no-await-in-loop */
import { dequal, getDefined } from '@decipad/utils';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import debounce from 'lodash.debounce';
import { createDocSyncEditor } from '@decipad/docsync';
import { editorToProgram } from '@decipad/editor-language-elements';
import {
  getRemoteComputer,
  type IdentifiedError,
  type IdentifiedResult,
  identifiedErrorToMessage,
  type RemoteComputer,
} from '@decipad/remote-computer';
import { getURLComponents } from '@decipad/editor-utils';
import type { Observe, Subscription } from '../types';
import { liveConnections } from './liveConnections';
import { EditorController } from '@decipad/notebook-tabs';

const debounceGetValueMs = 500;

export type OnErrorCallback = (error: Error) => void;

export const startNotebook = (
  subscription: Subscription,
  observeExternal: Observe,
  onError: OnErrorCallback
): RemoteComputer => {
  const { docId, blockId } = getURLComponents(subscription.params.url);
  const editor = new EditorController(docId);
  const syncEditor = createDocSyncEditor(docId, {
    readOnly: true,
    editor: new EditorController(docId, []),
    protocolVersion: 2,
  });

  const computer = getRemoteComputer();
  const { unsubscribe } = computer.results
    .pipe(
      map((result) => result.blockResults[blockId]),
      debounceTime(250),
      distinctUntilChanged((cur, next) => dequal(cur, next))
    )
    .subscribe((result: IdentifiedResult | IdentifiedError | undefined) => {
      if (result) {
        const identifier = computer.getSymbolDefinedInBlock(blockId);
        if (result.type === 'identified-error') {
          onError(new Error(identifiedErrorToMessage(result)));
        } else if (result.type === 'computer-result') {
          subscription.notify({
            meta: { title: identifier },
            result: result.result,
            loading: false,
          });
        }
      }
    });

  const {
    update: updateLiveConnections,
    destroy: destroyLiveConnections,
    getExternalData$,
  } = liveConnections(observeExternal);

  const getValue = debounce(async () => {
    const program = await editorToProgram(editor, editor.children, computer);
    computer.pushCompute({
      program,
    });
  }, debounceGetValueMs);

  const externalDataSubscription = getExternalData$.subscribe((data) => {
    if (data.has(blockId)) {
      subscription.notify(getDefined(data.get(blockId)).result);
    }
    getValue();
  });

  let closed = false;
  // eslint-disable-next-line no-param-reassign
  subscription.subscription = {
    get closed() {
      return closed;
    },
    unsubscribe: () => {
      closed = true;
      externalDataSubscription.unsubscribe();
      unsubscribe();
      destroyLiveConnections();
      syncEditor.disconnect();
      syncEditor.destroy();
    },
  };

  syncEditor.onLoaded(getValue);
  const { onChange } = syncEditor;
  syncEditor.onChange = () => {
    (async () => {
      updateLiveConnections(syncEditor.children);
    })();

    onChange.bind(syncEditor)();
  };

  return computer;
};
