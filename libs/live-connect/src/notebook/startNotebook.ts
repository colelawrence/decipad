import { dequal } from 'dequal';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { debounce, noop } from 'lodash';
import { createDocSyncEditor } from '@decipad/docsync';
import { getDefined } from '@decipad/utils';
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

export const startNotebook = async (
  subscription: Subscription,
  observeExternal: Observe,
  onError: OnErrorCallback
): Promise<Computer> => {
  const { docId, blockId } = getURLComponents(subscription.params.url);
  const editor = createTPlateEditor();
  editor.normalizeNode = noop;
  const syncEditor = createDocSyncEditor(docId, {
    readOnly: true,
    editor,
  });

  const computer = new Computer();
  const { unsubscribe } = computer.results
    .pipe(
      map((result) => result.blockResults[blockId]),
      debounceTime(250),
      distinctUntilChanged(dequal)
    )
    .subscribe((result: IdentifiedResult | IdentifiedError | undefined) => {
      if (result) {
        const identifier = computer.getDefinedSymbolInBlock(blockId);
        if (result.type === 'identified-error') {
          onError(new Error(identifiedErrorToMessage(result)));
        } else if (result.type === 'computer-result') {
          subscription.notify({
            meta: { title: identifier },
            result: result.result,
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
    computer.pushCompute(await editorToProgram(syncEditor, computer));
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
