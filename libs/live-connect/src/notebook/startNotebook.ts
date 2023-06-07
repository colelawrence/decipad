import { dequal, getDefined, noop } from '@decipad/utils';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import debounce from 'lodash.debounce';
import { createDocSyncEditor } from '@decipad/docsync';
import { editorToProgram } from '@decipad/editor-language-elements';
import {
  Computer,
  IdentifiedError,
  IdentifiedResult,
  identifiedErrorToMessage,
} from '@decipad/computer';
import { createTPlateEditor } from '@decipad/editor-types';
import { getURLComponents } from '@decipad/editor-utils';
import type { Observe, Subscription } from '../types';
import { liveConnections } from './liveConnections';

const debounceGetValueMs = 500;

export type OnErrorCallback = (error: Error) => void;

export const startNotebook = (
  subscription: Subscription,
  observeExternal: Observe,
  onError: OnErrorCallback
): Computer => {
  const { docId, blockId } = getURLComponents(subscription.params.url);
  const editor = createTPlateEditor();
  editor.normalizeNode = noop;
  const syncEditor = createDocSyncEditor(docId, {
    readOnly: true,
    editor,
    protocolVersion: 2,
  });

  const computer = new Computer();
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
    computer.pushCompute({
      program: await editorToProgram(syncEditor, syncEditor.children, computer),
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
      try {
        await updateLiveConnections(syncEditor.children);
        getValue();
      } catch (err) {
        onError(err as Error);
      }
    })();

    onChange();
  };

  return computer;
};
