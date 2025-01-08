/* eslint-disable no-labels */
import { getComputer, getExprRef } from '@decipad/computer';
import { type Computer } from '@decipad/computer-interfaces';
import type { DocSyncEditor, OnLoadedCallback } from '@decipad/docsync';
import { createDocSyncEditor } from '@decipad/docsync';
import {
  DataTabChildrenElement,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_STRUCTURED_VARNAME,
  MARK_MAGICNUMBER,
} from '@decipad/editor-types';
import {
  BlockProcessor,
  EditorController,
  elementNormalizersDataTab,
  generalEditorNormalizers,
} from '@decipad/notebook-tabs';
import { createRemoteComputerClient } from '@decipad/remote-computer';
import { isServerSideRendering } from '@decipad/support';
import { captureException } from '@sentry/react';
import * as idb from 'lib0/indexeddb';
import { DATA_TAB_INDEX } from 'libs/notebook-tabs/src/constants';
import debounce from 'lodash/debounce';
import { nanoid } from 'nanoid';
import { Subject, take } from 'rxjs';
import { createStore } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { cursorAwareness } from './cursors';
import { closeDataDrawerAnimation } from './dataDrawer';
import { isNewNotebook } from './isNewNotebook';
import type { EnhancedPromise, NotebookState } from './state';
import { once } from '@decipad/utils';

const LOAD_TIMEOUT_MS = 5000;
const HAS_NOT_SAVED_IN_A_WHILE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const COMPUTER_DEBOUNCE = 1000;

const initialState = (): Omit<
  NotebookState,
  | 'initEditor'
  | 'destroy'
  | 'setInitialFocusDone'
  | 'computer'
  | 'isAddingOrEditingVariable'
  | 'editingVariableId'
  | 'setAddVariable'
  | 'setEditingVariable'
  | 'closeDataDrawer'
  | 'handleExpandedBlockId'
  | 'setPermission'
  | 'setAnnotations'
  | 'permission'
  | 'expandedBlockId'
  | 'annotations'
  | 'height'
  | 'setHeight'
  | 'isClosing'
  | 'setIntegration'
  | 'setWorkspaceNumber'
  | 'isDataDrawerOpen'
  | 'setIsDataDrawerOpen'
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
    controller: undefined,
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
    editorChanges: new Subject(),
    interactionsSubscription: undefined,
    dataDrawerMode: {
      type: 'closed',
    },
  };
};

const isSafari = once(() => {
  // Primary check using newer API
  if ('userAgentData' in navigator) {
    return (navigator as any).userAgentData.brands.some(
      (brand: { brand: string }) => brand.brand.includes('Safari')
    );
  }
  // Fallback to feature detection
  return (
    !('chrome' in window) &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent)
  );
});

const createComputer = (notebookId: string): Computer => {
  if (isSafari()) {
    console.warn('notebook store: Using local computer in Safari');
    return getComputer();
  }
  return createRemoteComputerClient(notebookId, (err) => {
    if (err) {
      console.error('notebook store: Error in remote computer client', err);
      captureException(err);
    }
  });
};

export const createNotebookStore = (
  notebookId: string,
  onDestroy: () => void
) =>
  createStore(
    subscribeWithSelector<NotebookState>((set, get) => ({
      ...initialState(),
      computer: createComputer(notebookId),
      initEditor: ({
        notebookId: _notebookId,
        options,
        getSession,
        interactions,
      }) => {
        const { docsync, plugins, onChangeTitle } = options;
        // verify that if we have a matching connected docsync instance
        const { editor: oldEditor, syncClientState, computer } = get();
        if (oldEditor) {
          if (
            syncClientState === 'created' &&
            oldEditor.id === notebookId &&
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

        const controller = new EditorController(
          notebookId,
          [generalEditorNormalizers, ...plugins],
          elementNormalizersDataTab
        );
        const blockProcessor = new BlockProcessor(
          controller,
          computer,
          notebookId,
          COMPUTER_DEBOUNCE
        );

        const interactionsSubscription = interactions.subscribe((i) => {
          if (i.type !== 'inline-equal') {
            return;
          }

          const dataTabVarId = nanoid();

          controller.apply({
            type: 'insert_node',
            path: [
              DATA_TAB_INDEX,
              controller.children[DATA_TAB_INDEX].children.length,
            ],
            node: {
              type: ELEMENT_DATA_TAB_CHILDREN,
              id: dataTabVarId,
              children: [
                {
                  type: ELEMENT_STRUCTURED_VARNAME,
                  id: nanoid(),
                  children: [{ text: '' }],
                },
                {
                  type: ELEMENT_CODE_LINE_V2_CODE,
                  id: nanoid(),
                  children: [{ text: '' }],
                },
              ],
            } satisfies DataTabChildrenElement,
          });

          const childPath = [...i.path];
          childPath[childPath.length - 1] += 1;

          controller.apply({
            type: 'insert_node',
            path: [controller.activeEditorIndex, ...childPath],
            node: {
              text: getExprRef(dataTabVarId),
              [MARK_MAGICNUMBER]: true,
            },
          });

          const { setEditingVariable } = get();
          setEditingVariable(dataTabVarId);
        });

        const changeTitleNoDebounce = (title: string) => {
          const { destroyed } = get();
          if (!destroyed) {
            onChangeTitle(title);
          }
        };

        const changeTitle = debounce(changeTitleNoDebounce, 1000);

        const { onChange } = controller;

        let oldTitle: string | undefined;
        controller.onChange = () => {
          onChange();

          const title = controller.getTitle();

          if (title == null) {
            return;
          }

          if (oldTitle == null) {
            oldTitle = title;
            changeTitleNoDebounce(title);
            return;
          }

          if (title !== oldTitle) {
            oldTitle = title;
            changeTitle(oldTitle);
          }
        };

        const newNotebook =
          docsync.initialState != null && isNewNotebook(docsync.initialState);

        const docSyncEditor = createDocSyncEditor(
          notebookId,
          {
            ...docsync,
            editor: controller,
            onError: captureException,
          },
          getSession
        );

        //
        // Only to be used in read mode.
        // It clears all the current read mode changes and resets notebook
        // back to the latest published versions state.
        //
        docSyncEditor.clearAll = function overridenClearAll() {
          const isReadOnly = Boolean(docSyncEditor.isReadOnly);
          if (!isReadOnly) {
            throw new Error(
              'Dont call this when not isReadOnly, youll destroy your notebook'
            );
          }

          idb.deleteDB(`${docSyncEditor.id}:readonly`).then(() => {
            docSyncEditor.destroy();
            // Forces us to get a new editor.
            set(() => ({
              editor: undefined,
            }));
          });
        };

        // ==== Cursor awareness ====

        cursorAwareness(docSyncEditor);

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
          controller,
          notebookHref: isServerSideRendering() ? '' : window.location.pathname,
          syncClientState: 'created',
          loadedFromLocal: false,
          loadedFromRemote: false,
          timedOutLoadingFromRemote: false,
          hasLocalChanges: false,
          destroyed: false,
          isNewNotebook: newNotebook,
          blockProcessor,
          interactionsSubscription,
        });
      },
      setInitialFocusDone: () => {
        set({ initialFocusDone: true });
      },

      destroy: () => {
        const { syncClientState, editor, interactionsSubscription } = get();
        if (syncClientState === 'created') {
          editor?.disconnect();
          editor?.destroy();
          set({ ...initialState(), destroyed: true });
          onDestroy();
          interactionsSubscription?.unsubscribe();
        }
      },

      // Data Drawer

      isAddingOrEditingVariable: undefined,
      editingVariableId: undefined,

      setAddVariable() {
        set(() => ({
          dataDrawerMode: {
            type: 'create',
          },
        }));
      },

      setEditingVariable(id) {
        set(() => ({
          dataDrawerMode: {
            type: 'edit',
            variableId: id,
          },
        }));
      },

      setIntegration() {
        set(() => ({ dataDrawerMode: { type: 'integration-preview' } }));
      },

      closeDataDrawer() {
        set(() => ({
          dataDrawerMode: {
            type: 'closed',
          },
        }));
      },

      setWorkspaceNumber(workspaceNumberId) {
        set(() => ({
          dataDrawerMode: { type: 'workspace-number', workspaceNumberId },
        }));
      },

      // Annotations

      annotations: [],
      expandedBlockId: undefined,
      permission: undefined,

      handleExpandedBlockId(id) {
        set(() => ({ expandedBlockId: id }));
      },

      setPermission(permission) {
        set(() => ({ permission }));
      },

      setAnnotations(annotations) {
        set(() => ({ annotations }));
      },

      isDataDrawerOpen: false,
      setIsDataDrawerOpen(isDataDrawerOpen) {
        set(() => ({
          isDataDrawerOpen,
        }));
      },

      isClosing: false,
      height: INITIAL_DATA_DRAWER_HEIGHT,
      setHeight(h) {
        const { isClosing, closeDataDrawer, height: dataDrawerHeight } = get();

        if (isClosing) {
          return;
        }

        if (h < 80) {
          set(() => ({ isClosing: true }));
          closeDataDrawerAnimation(
            dataDrawerHeight,
            (newHeight) => set(() => ({ height: newHeight })),
            () => {
              closeDataDrawer();
              setTimeout(
                () =>
                  set(() => ({
                    height: INITIAL_DATA_DRAWER_HEIGHT,
                    isClosing: false,
                  })),
                100
              );
            }
          );
          return;
        }

        let height = h;

        if (height < MIN_DATA_DRAWER_HEIGHT) {
          height = MIN_DATA_DRAWER_HEIGHT;
        }

        set(() => ({ height }));
      },
    }))
  );

const MIN_DATA_DRAWER_HEIGHT = 200;
const INITIAL_DATA_DRAWER_HEIGHT = MIN_DATA_DRAWER_HEIGHT;
