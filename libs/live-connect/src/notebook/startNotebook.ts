/* eslint-disable no-await-in-loop */
import debounce from 'lodash.debounce';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { dequal, getDefined } from '@decipad/utils';
import type {
  Computer,
  IdentifiedError,
  IdentifiedResult,
} from '@decipad/computer-interfaces';
import { createDocSyncEditor } from '@decipad/docsync';
import { editorToProgram } from '@decipad/editor-language-elements';
// eslint-disable-next-line no-restricted-imports
import { identifiedErrorToMessage, getComputer } from '@decipad/computer';
import { getURLComponents } from '@decipad/editor-utils';
import { EditorController } from '@decipad/notebook-tabs';
import type { Observe, Subscription } from '../types';
import { liveConnections } from './liveConnections';

const debounceGetValueMs = 500;

export type OnErrorCallback = (error: Error) => void;

export type StartNotebook = (
  subscription: Subscription,
  observeExternal: Observe,
  onError: OnErrorCallback
) => Computer;

export const startNotebook: StartNotebook = (
  subscription,
  observeExternal,
  onError
) => {
  const { docId, blockId } = getURLComponents(subscription.params.url);
  // eslint-disable-next-line no-new
  new EditorController(docId);
  const syncEditor = createDocSyncEditor(docId, {
    readOnly: true,
    editor: new EditorController(docId, []),
    protocolVersion: 2,
  });

  const computer = getComputer();
  const { unsubscribe } = computer.results
    .pipe(
      map((result) => result.blockResults[blockId]),
      debounceTime(250),
      distinctUntilChanged((cur, next) => dequal(cur, next))
    )
    .subscribe(
      async (result: IdentifiedResult | IdentifiedError | undefined) => {
        if (result) {
          const identifier = await computer.getSymbolDefinedInBlock(blockId);
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
      }
    );

  const {
    update: updateLiveConnections,
    destroy: destroyLiveConnections,
    getExternalData$,
  } = liveConnections(observeExternal);

  const getValue = debounce(async () => {
    const program = await editorToProgram(
      syncEditor,
      syncEditor.children.filter(Boolean),
      computer
    );
    await computer.pushProgramBlocks(program);
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
  const onChange = syncEditor.onChange.bind(syncEditor);
  syncEditor.onChange = () => {
    (async () => {
      updateLiveConnections(syncEditor.children);
    })();

    getValue();
    onChange();
  };

  return computer;
};
