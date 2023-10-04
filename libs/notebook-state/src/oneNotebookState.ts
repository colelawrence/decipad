import {
  createDocSyncEditor,
  DocSyncEditor,
  OnLoadedCallback,
} from '@decipad/docsync';
import { createStore } from 'zustand';
import { captureException } from '@sentry/browser';
import { take } from 'rxjs';
import { Computer } from '@decipad/computer';
import { isServerSideRendering } from '@decipad/support';
import {
  EditorController,
  BlockProcessor,
  TitleElement,
} from '@decipad/notebook-tabs';
import { NotebookState, EnhancedPromise } from './state';
import { isNewNotebook } from './isNewNotebook';
import { CursorAwarenessSchedule } from './cursors';
import debounce from 'lodash.debounce';

const LOAD_TIMEOUT_MS = 5000;
const HAS_NOT_SAVED_IN_A_WHILE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const COMPUTER_DEBOUNCE = 100;

let interval: NodeJS.Timer | null;

const initialState = (): Omit<
  NotebookState,
  'initEditor' | 'destroy' | 'setInitialFocusDone' | 'computer'
> => {
  let resolveNotebookLoadedPromise: (e: DocSyncEditor) => void;
  const notebookLoadedPromise: EnhancedPromise<DocSyncEditor> =
    new Promise<DocSyncEditor>((r) => {
      resolveNotebookLoadedPromise = (e: DocSyncEditor) => {
        // setTimeout(() => {
        notebookLoadedPromise.resolved = e;
        r(e);
        // }, 0);
      };
    }) as unknown as EnhancedPromise<DocSyncEditor>;
  return {
    blockProcessor: undefined,
    syncClientState: 'idle',
    editor: undefined,
    loadedFromLocal: false,
    loadedFromRemote: false,
    timedOutLoadingFromRemote: false,
    hasLocalChanges: false,
    initialFocusDone: false,
    isNewNotebook: true,
    hasNotSavedRemotelyInAWhile: false,
    notebookLoadedPromise,
    resolveNotebookLoadedPromise: () => {
      return resolveNotebookLoadedPromise;
    },
  };
};

export const createNotebookStore = (onDestroy: () => void) =>
  createStore<NotebookState>((set, get) => ({
    ...initialState(),
    computer: new Computer(),
    initEditor: (
      notebookId,
      { docsync, plugins, onChangeTitle },
      getSession
    ) => {
      // verify that if we have a matching connected docsync instance
      const { editor: oldEditor, syncClientState, computer } = get();
      if (oldEditor) {
        if (
          syncClientState === 'created' &&
          oldEditor.editorController.NotebookId === notebookId &&
          oldEditor.isReadOnly === docsync.readOnly &&
          !oldEditor.destroyed
        ) {
          // the one we have is just fine
          return;
        }
        try {
          oldEditor.disconnect();
          oldEditor.destroy();
        } catch (err) {
          console.error('error destroying old docsync instance', err);
        }
      }

      if (!computer) {
        throw new Error('Where is my computer');
      }

      const controller = new EditorController(notebookId, plugins);
      const blockProcessor = new BlockProcessor(
        controller,
        computer,
        COMPUTER_DEBOUNCE
      );

      const changeTitle = debounce((title: string) => {
        onChangeTitle(title);
      }, 1000);

      const { onChange } = controller.TitleEditor;

      let oldTitle: string = '';
      controller.TitleEditor.onChange = () => {
        const title = controller.TitleEditor.children[0] as TitleElement;
        if (title?.children?.[0]?.text !== oldTitle) {
          oldTitle = title?.children?.[0]?.text;
          changeTitle(oldTitle);
        }
        onChange();
      };

      const newNotebook =
        docsync.initialState != null && isNewNotebook(docsync.initialState);

      const docSyncEditor = createDocSyncEditor(
        notebookId,
        {
          ...docsync,
          controller,
          onError: captureException,
        },
        getSession
      );

      // ==== Cursor awareness ====

      if (interval != null) {
        clearInterval(interval);
      }

      interval = setInterval(
        () => CursorAwarenessSchedule(docSyncEditor),
        1000
      );

      // ==== End Cursor awareness ====

      // Its here.
      const loadTimeout = setTimeout(() => {
        set({ timedOutLoadingFromRemote: true });
        const { resolveNotebookLoadedPromise, editor } = get();
        if (editor) {
          resolveNotebookLoadedPromise()(editor);
        }
      }, LOAD_TIMEOUT_MS);

      const onDocSyncEditorLoaded: OnLoadedCallback = (source) => {
        if (source === 'local') {
          set({ loadedFromLocal: true });
        } else if (source === 'remote') {
          clearTimeout(loadTimeout);
          set({ loadedFromRemote: true });
          docSyncEditor.offLoaded(onDocSyncEditorLoaded);
          const { resolveNotebookLoadedPromise } = get();
          resolveNotebookLoadedPromise()(docSyncEditor);
        }
      };

      docSyncEditor.onLoaded(onDocSyncEditorLoaded);
      docSyncEditor
        .hasLocalChanges()
        .pipe(take(1))
        .subscribe(() => {
          set({ hasLocalChanges: true });
        });

      // ------------ Not saved remotely timeout
      // Populates the `hasNotSavedRemotelyInAWhile` flag if enough time has passed
      // since the last time the notebook was saved remotely.

      if (!docSyncEditor.isReadOnly) {
        const notSavedTimeoutReached = () => {
          if (!docSyncEditor.isSavedRemotely().value) {
            set({ hasNotSavedRemotelyInAWhile: true });
          }
          scheduleNotSavedTimeout();
        };
        let notSavedTimeout: ReturnType<typeof setTimeout> | undefined;
        const scheduleNotSavedTimeout = () => {
          clearTimeout(notSavedTimeout);
          notSavedTimeout = setTimeout(
            notSavedTimeoutReached,
            HAS_NOT_SAVED_IN_A_WHILE_TIMEOUT_MS
          );
        };
        scheduleNotSavedTimeout();
        docSyncEditor.onSaved((source) => {
          if (source === 'remote') {
            if (get().hasNotSavedRemotelyInAWhile) {
              set({ hasNotSavedRemotelyInAWhile: false });
            }
            scheduleNotSavedTimeout();
          }
        });
      }

      set({
        editor: docSyncEditor,
        notebookHref: isServerSideRendering() ? '' : window.location.pathname,
        syncClientState: 'created',
        loadedFromLocal: false,
        loadedFromRemote: false,
        timedOutLoadingFromRemote: false,
        hasLocalChanges: false,
        destroyed: false,
        isNewNotebook: newNotebook,
        blockProcessor,
      });
    },
    setInitialFocusDone: () => {
      set({ initialFocusDone: true });
    },
    destroy: () => {
      const { syncClientState, editor } = get();
      if (syncClientState === 'created') {
        editor?.disconnect();
        editor?.destroy();
        set({ ...initialState(), destroyed: true });
        onDestroy();
      }
    },
  }));
