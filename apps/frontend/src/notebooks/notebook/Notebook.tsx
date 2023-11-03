/* eslsnt-disable prefer-destructuring */
import {
  type RemoteComputer,
  getRemoteComputer,
} from '@decipad/remote-computer';
import { DocSyncEditor } from '@decipad/docsync';
import { EditorSidebar } from '@decipad/editor-components';
import {
  EditorNotebookFragment,
  useFinishOnboarding,
  useGetNotebookMetaQuery,
  useRenameNotebookMutation,
} from '@decipad/graphql-client';
import {
  ComputerContextProvider,
  EditorChangeContextProvider,
  useCurrentWorkspaceStore,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { notebooks, useRouteParams } from '@decipad/routing';
import { isServerSideRendering } from '@decipad/support';
import {
  EditorPlaceholder,
  NotebookPage,
  GlobalThemeStyles,
  TopbarPlaceholder,
  NotebookTopbar,
  EditorIcon,
  NotebookTabs,
  AssistantChatPlaceholder,
} from '@decipad/ui';
import {
  FC,
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Subject, interval, debounce } from 'rxjs';
import { ErrorPage, RequireSession } from '../../meta';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { useNotebookStateAndActions } from './hooks/useNotebookStateAndActions';
import { lazyLoad } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { useEditorUndoState } from './hooks';
import { useNotebookAccessActions, useNotebookMetaActions } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import {
  ControllerProvider,
  EditorController,
  useActiveEditor,
  useTabs,
} from '@decipad/notebook-tabs';
import { isFlagEnabled } from '@decipad/feature-flags';

export const loadEditor = () => {
  return import(/* webpackChunkName: "notebook-editor" */ './Editor');
};
const Editor = lazyLoad(loadEditor);

export const loadAssistantChat = () => {
  return import(/* webpackChunkName: "notebook-assistant" */ './AssistantChat');
};
const AssistantChat = lazyLoad(loadAssistantChat);

const ChangesNotebook: FC = () => {
  const [changeSubject] = useState(() => new Subject<undefined>());
  return (
    <EditorChangeContextProvider changeSubject={changeSubject}>
      <NewNotebook />
    </EditorChangeContextProvider>
  );
};

export default ChangesNotebook;

/**
 * Entire Application Wrapper.
 *
 * It does no requesting or suspending itself (And should remain this way).
 * And instead renders the suspense barriers, and components that will suspend themselves.
 *
 * This is the only component that should contain suspend barriers.
 */
export const NewNotebook: FC = () => {
  const {
    notebook: { id: notebookId },
    embed: _embed,
  } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  const [docsync, setDocsync] = useState<DocSyncEditor | undefined>();
  const [computer, setComputer] = useState<RemoteComputer>(getRemoteComputer());
  const [error, setError] = useState<Error | undefined>(undefined);

  useAnimateMutations();
  useFinishOnboarding();

  if (error) {
    return getNotebookError(error);
  }

  return (
    <DocsyncEditorProvider.Provider value={docsync}>
      <ControllerProvider.Provider value={docsync?.editorController}>
        <ComputerContextProvider computer={computer}>
          <NotebookPage
            notebook={
              <Suspense fallback={<EditorPlaceholder />}>
                <NewEditor
                  notebookId={notebookId}
                  setDocsync={setDocsync}
                  setComputer={setComputer}
                  setError={setError}
                />
              </Suspense>
            }
            topbar={
              <Suspense fallback={<TopbarPlaceholder />}>
                <NewTopbar notebookId={notebookId} />
              </Suspense>
            }
            sidebar={<NewSidebar docsync={docsync} />}
            tabs={
              !isEmbed && docsync?.editorController && isFlagEnabled('TABS') ? (
                <NewTabs
                  notebookId={notebookId}
                  controller={docsync.editorController}
                />
              ) : null
            }
            assistant={
              isFlagEnabled('AI_ASSISTANT_CHAT') ? (
                <Suspense fallback={<AssistantChatPlaceholder />}>
                  <NewAssistant notebookId={notebookId} />
                </Suspense>
              ) : null
            }
            isEmbed={isEmbed}
          />
        </ComputerContextProvider>
      </ControllerProvider.Provider>
    </DocsyncEditorProvider.Provider>
  );
};

const NewTabs: FC<{
  notebookId: string;
  controller: EditorController;
}> = ({ notebookId, controller }) => {
  const tabs = useTabs(controller);
  const { notebook, tab } = useRouteParams(notebooks({}).notebook);
  const docsync = useContext(DocsyncEditorProvider);

  const { isReadOnly } = useNotebookStateAndActions({
    notebookId,
    docsync,
  });

  const nav = useNavigate();

  const defaultTabId = tabs.find((t) => !t.isHidden)?.id ?? tabs[0]?.id;

  // if we are in read mode and there is only one tab and it is hidden, then we don't render the tabs
  if (tabs.filter((t) => !t.isHidden).length === 1 && isReadOnly) {
    return null;
  }

  return (
    <NotebookTabs
      tabs={tabs.map(({ id, name, icon, isHidden }) => ({
        id,
        name,
        icon,
        isHidden,
      }))}
      isReadOnly={isReadOnly}
      activeTabId={tab ?? defaultTabId}
      onClick={(id) => {
        nav(`${notebooks({}).notebook({ notebook }).$}/${id}`);
      }}
      onCreateTab={() => {
        const id = controller.CreateTab();
        nav(`${notebooks({}).notebook({ notebook }).$}/${id}`);
        return id;
      }}
      onRenameTab={controller.RenameTab.bind(controller)}
      onDeleteTab={(id) => {
        // No deleting the last tab
        if (tabs.length <= 1) return;

        const tabIndex = tabs.findIndex((t) => t.id === id);

        controller.RemoveTab(id);
        if (id !== tab) return;

        // We are deleting the currently active tab.
        // We must navigate elsewhere
        const newSelectedTabIndex = tabs.at(tabIndex - 1) ?? tabs.at(0);

        nav(
          `${notebooks({}).notebook({ notebook }).$}/${newSelectedTabIndex?.id}`
        );
      }}
      onMoveTab={(id, index) => {
        const tabIndex = tabs.findIndex((t) => t.id === id);

        // check if tab exists
        if (tabIndex === -1) return;
        // check if tab is already in the correct position
        if (tabIndex === index) return;

        // check if index is not out of bounds
        if (index < 0 || index > tabs.length - 1) return;

        // how many operations we perform to get to the desired index
        const steps = Math.abs(index - tabIndex);
        // -1 -> left, 1 -> right
        const direction = Math.sign(index - tabIndex);

        for (let i = 1; i <= steps; i += 1) {
          const swapTab = tabs[tabIndex + i * direction];

          if (!swapTab) return;
          controller.MoveTabs(id, swapTab.id);
        }
      }}
      onChangeIcon={controller.ChangeTabIcon.bind(controller)}
      onToggleShowHide={controller.ToggleShowHideTab.bind(controller)}
    />
  );
};

/**
 * Entire Editor Wrapper.
 *
 * Responsible for loading all backend data it needs.
 */
const NewEditor: FC<{
  notebookId: string;
  setDocsync: (docsync: DocSyncEditor) => void;
  setComputer: (computer: RemoteComputer) => void;
  setError: (error: Error | undefined) => void;
}> = ({ notebookId, setDocsync, setComputer, setError }) => {
  const docsync = useContext(DocsyncEditorProvider);

  const actions = useNotebookStateAndActions({
    notebookId,
    docsync,
  });

  useEffect(() => {
    if (actions.error) {
      setError(actions.error);
    }
  }, [actions.error, setError]);

  useSetWorkspaceQuota(actions.notebook?.workspace);

  useEffect(() => {
    // Hack. We must be the last ones to set the title of the notebook.
    setTimeout(() => {
      document.title = `${actions.notebook?.name ?? 'New Notebook'} | Decipad`;
    }, 0);
  }, [actions.notebook?.name]);

  const onNotebookTitleChange = useNotebookTitleChange(
    actions.notebook?.id ?? 'New Notebook'
  );

  return (
    <>
      <GlobalThemeStyles color={actions.iconColor} />
      <EditorIcon
        icon={actions.icon ?? 'Deci'}
        color={actions.iconColor}
        onChangeIcon={actions.updateIcon}
        onChangeColor={actions.updateIconColor}
      />
      <Editor
        secret={undefined}
        notebookId={notebookId}
        onNotebookTitleChange={onNotebookTitleChange}
        onDocsync={setDocsync}
        onComputer={setComputer}
        notebookMetaLoaded={actions.notebook != null}
        workspaceId={actions.notebook?.workspace?.id ?? ''}
        readOnly={actions.isReadOnly}
        connectionParams={actions.connectionParams}
        initialState={actions.initialState}
        getAttachmentForm={actions.getAttachmentForm}
        onAttached={actions.onAttached}
        onCreateSnapshot={actions.onCreateSnapshot}
      />
    </>
  );
};

function useSetWorkspaceQuota(workspace: EditorNotebookFragment['workspace']) {
  const { setCurrentWorkspaceInfo } = useCurrentWorkspaceStore();
  useEffect(() => {
    if (!workspace) return;

    setCurrentWorkspaceInfo({
      id: workspace?.id,
      isPremium: Boolean(workspace?.isPremium),
      quotaLimit: workspace?.workspaceExecutedQuery?.quotaLimit,
      queryCount: workspace?.workspaceExecutedQuery?.queryCount,
    });
  }, [workspace, setCurrentWorkspaceInfo]);
}

function useNotebookTitleChange(notebookId: string) {
  const [, renameNotebook] = useRenameNotebookMutation();
  return useCallback(
    (newName?: string) => {
      if (newName != null && !isServerSideRendering()) {
        const nameTrimmed = newName.trim();
        renameNotebook({
          id: notebookId,
          name: nameTrimmed,
        });
        window.history.replaceState(
          {},
          nameTrimmed,
          notebooks({}).notebook({
            notebook: { id: notebookId, name: nameTrimmed },
          }).$
        );
      }
    },
    [notebookId, renameNotebook]
  );
}

const DEBOUNCE_HAS_UNPUBLISHED_CHANGES_TIME_MS = 1_000;
const SNAPSHOT_NAME = 'Published 1';

/**
 * Entire Topbar Wrapper.
 *
 * Responsible for loading topbar dependencies, and all its elements.
 */
const NewTopbar: FC<{ notebookId: string }> = ({ notebookId }) => {
  const docsync = useContext(DocsyncEditorProvider);

  const actions = useNotebookMetaActions();
  const accessActions = useNotebookAccessActions();

  const sidebarData = useNotebookMetaData((state) => ({
    sidebarOpen: state.sidebarOpen,
    toggleSidebar: state.toggleSidebar,
    hasPublished: state.hasPublished,
  }));

  const aiModeData = useNotebookMetaData((state) => ({
    aiMode: state.aiMode,
    toggleAiMode: state.toggleAIMode,
  }));

  const [canUndo, canRedo] = useEditorUndoState(docsync);

  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });
  const permission = meta.data?.getPadById?.myPermissionType;

  const { embed: _embed } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  /**
   * Edge case. We default to a closed sidebar,
   * so that in read mode we don't get any jumps on the sidebar.
   *
   * This is only a problem IF its the users first time writing on the platform
   * Where we must toggle their sidebar open by default
   */
  useEffect(() => {
    switch (permission) {
      case 'ADMIN':
      case 'WRITE': {
        const { name } = useNotebookMetaData.persist.getOptions();
        if (!name) return;
        const hasStorage = localStorage.getItem(name) != null;
        if (!hasStorage) {
          sidebarData.toggleSidebar();
        }
        break;
      }
      default: {
        if (sidebarData.sidebarOpen) {
          sidebarData.toggleSidebar();
        }
      }
    }

    if (!useNotebookMetaData.persist.hasHydrated()) {
      useNotebookMetaData.persist.rehydrate();
    }
  }, [permission, sidebarData]);

  const isPublic = meta.data?.getPadById?.isPublic;
  const snapshot = meta.data?.getPadById?.snapshots.find(
    (s) => s.snapshotName === SNAPSHOT_NAME
  );

  const [snapshotVersion, setSnapshotVersion] = useState(snapshot?.version);

  useEffect(() => {
    const sub = sidebarData.hasPublished.subscribe(() => {
      setHasUnpublishedChanges(false);
      setSnapshotVersion(docsync?.getVersionChecksum());
    });
    return () => {
      sub.unsubscribe();
    };
  }, [docsync, sidebarData.hasPublished]);

  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  useEffect(() => {
    const debouncedSub = docsync?.editorController.Notifier.pipe(
      debounce(() => interval(DEBOUNCE_HAS_UNPUBLISHED_CHANGES_TIME_MS))
    );

    const sub = debouncedSub?.subscribe(() => {
      if (isPublic && !(snapshotVersion && docsync?.equals(snapshotVersion))) {
        setHasUnpublishedChanges(true);
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [docsync, docsync?.editorController.Notifier, isPublic, snapshotVersion]);

  const [isNewNotebook, setIsNewNotebook] = useState(false);
  useEffect(() => {
    setIsNewNotebook(Boolean(docsync?.editorController.IsNewNotebook));
  }, [docsync?.editorController.IsNewNotebook]);

  const revertChanges = useCallback(() => {
    while (docsync?.undoManager?.canUndo()) {
      docsync.undoManager.undo();
    }
  }, [docsync?.undoManager]);

  if (!meta.data?.getPadById) {
    return <TopbarPlaceholder />;
  }

  return (
    <NotebookTopbar
      onRevertChanges={revertChanges}
      permissionType={permission}
      hasUnpublishedChanges={hasUnpublishedChanges}
      notebookMeta={meta.data?.getPadById}
      userWorkspaces={meta.data?.workspaces ?? []}
      notebookMetaActions={actions}
      notebookAccessActions={accessActions}
      isNewNotebook={isNewNotebook}
      canUndo={canUndo}
      canRedo={canRedo}
      isEmbed={isEmbed}
      onRedo={() => docsync?.undoManager?.redo() || noop}
      onUndo={() => docsync?.undoManager?.undo() || noop}
      onClearAll={() => docsync?.editorController.ClearAll()}
      sidebarOpen={sidebarData.sidebarOpen}
      toggleSidebar={sidebarData.toggleSidebar}
      aiMode={aiModeData.aiMode}
      toggleAIMode={aiModeData.toggleAiMode}
    />
  );
};

const NewSidebar: FC<{ docsync: DocSyncEditor | undefined }> = ({
  docsync,
}) => {
  const [isSidebarOpen] = useNotebookMetaData((state) => [state.sidebarOpen]);

  const { embed: _embed } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  const editor = useActiveEditor(docsync?.editorController);

  if (isSidebarOpen && !isEmbed && editor) {
    return <EditorSidebar editor={editor} />;
  }

  return null;
};

type NewAssistantProps = {
  notebookId: string;
};

const NewAssistant: FC<NewAssistantProps> = ({ notebookId }) => {
  const docsync = useContext(DocsyncEditorProvider);

  const [isAssistantOpen] = useNotebookMetaData((state) => [state.aiMode]);

  const { embed: _embed } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  if (isAssistantOpen && !isEmbed && docsync?.editorController) {
    return (
      <AssistantChat
        notebookId={notebookId}
        controller={docsync.editorController}
      />
    );
  }

  return null;
};

const DocsyncEditorProvider = createContext<DocSyncEditor | undefined>(
  undefined
);

export function getNotebookError(error: Error | undefined): JSX.Element | null {
  if (error) {
    if (/no such/i.test(error?.message))
      return <ErrorPage Heading="h1" wellKnown="404" />;
    if (/forbidden/i.test(error?.message)) {
      return (
        <RequireSession>
          <ErrorPage Heading="h1" wellKnown="403" />
        </RequireSession>
      );
    }
    throw error;
  }
  return null;
}
