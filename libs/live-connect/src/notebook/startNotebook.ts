import { createEditor } from 'slate';
import { dequal } from 'dequal';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { debounce } from 'lodash';
import { createDocSyncEditor } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import { editorToProgram } from '@decipad/editor-language-elements';
import { Computer, IdentifiedError, IdentifiedResult } from '@decipad/computer';
import type { Observe, Subscription } from '../types';
import { liveConnections } from './liveConnections';

const debounceGetValueMs = 500;

type GetURLComponentsResult = {
  docId: string;
  blockId: string;
};

const getURLComponents = (source: string): GetURLComponentsResult => {
  const url = new URL(source);
  const docIdMatch = getDefined(
    url.pathname.match(/^\/n\/(.*)/),
    `Could not find notebook id from URL${url}`
  );
  const blockId = url.hash.slice(1);
  let docId = decodeURIComponent(
    getDefined(docIdMatch[1], `no doc id on URL ${url}`)
  );
  if (docId.indexOf(':') >= 0) {
    docId = docId.slice(docId.indexOf(':') + 1);
  }

  return { docId, blockId };
};

export type OnErrorCallback = (error: Error) => void;

export const startNotebook = async (
  subscription: Subscription,
  observeExternal: Observe,
  onError: OnErrorCallback
): Promise<Computer> => {
  const { docId, blockId } = getURLComponents(subscription.params.url);
  const syncEditor = createDocSyncEditor(createEditor() as MyEditor, docId, {
    readOnly: true,
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
        if (result.type === 'computer-parse-error') {
          onError(new Error(result.error.message));
        } else if (result.type === 'computer-result') {
          subscription.notify(result.result);
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
