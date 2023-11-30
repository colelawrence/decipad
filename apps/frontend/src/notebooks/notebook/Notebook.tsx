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
  useGetWorkspacesQuery,
  useRenameNotebookMutation,
} from '@decipad/graphql-client';
import {
  ComputerContextProvider,
  ControllerProvider,
  EditorChangeContextProvider,
  EditorStylesContext,
  useCurrentWorkspaceStore,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { notebooks, useRouteParams, workspaces } from '@decipad/routing';
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
  useMemo,
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
import { isFlagEnabled } from '@decipad/feature-flags';
import { useActiveEditor, useTabs } from '@decipad/editor-hooks';
import { MinimalRootEditorWithEventsAndTabs } from '@decipad/editor-types';
import { Helmet } from 'react-helmet';

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
    <DocsyncEditorProvider.Provider value={docsync} key={notebookId}>
      <ControllerProvider.Provider value={docsync}>
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
              !isEmbed && docsync && isFlagEnabled('TABS') ? (
                <NewTabs notebookId={notebookId} controller={docsync} />
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
  controller: MinimalRootEditorWithEventsAndTabs;
}> = ({ notebookId, controller }) => {
  const { notebook, tab, embed } = useRouteParams(notebooks({}).notebook);
  const docsync = useContext(DocsyncEditorProvider);

  const { isReadOnly } = useNotebookStateAndActions({
    notebookId,
    docsync,
  });

  const tabs = useTabs(isReadOnly);
  const nav = useNavigate();

  const defaultTabId = tabs.at(0)?.id;

  if (tabs.length === 1 && isReadOnly) {
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
      isEmbed={Boolean(embed)}
      isReadOnly={isReadOnly}
      activeTabId={tab ?? defaultTabId}
      onClick={(id) => {
        nav(notebooks({}).notebook({ notebook, tab: id, embed }).$);
      }}
      onCreateTab={() => {
        const id = controller.insertTab();
        nav(`${notebooks({}).notebook({ notebook, embed }).$}/${id}`);
        return id;
      }}
      onRenameTab={controller.renameTab.bind(controller)}
      onDeleteTab={(id) => {
        // No deleting the last tab
        if (tabs.length <= 1) return;

        const tabIndex = tabs.findIndex((t) => t.id === id);

        controller.removeTab(id);
        if (id !== tab) return;

        // We are deleting the currently active tab.
        // We must navigate elsewhere
        const newSelectedTabIndex = tabs.at(tabIndex - 1) ?? tabs.at(0);

        nav(
          notebooks({}).notebook({
            notebook,
            tab: newSelectedTabIndex?.id,
            embed,
          }).$
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
          controller.moveTabs(id, swapTab.id);
        }
      }}
      onChangeIcon={controller.changeTabIcon.bind(controller)}
      onToggleShowHide={controller.toggleShowHideTab.bind(controller)}
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

  const onNotebookTitleChange = useNotebookTitleChange(
    actions.notebook?.id ?? 'New Notebook'
  );
  const { embed: _embed } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  const pageTitle = `${actions.notebook?.name ?? 'New Notebook'} | Decipad`;

  useEffect(() => {
    // ugly hack to update the document title
    const intv = setInterval(() => {
      document.title = pageTitle;
    }, 1000);

    return () => clearInterval(intv);
  }, [pageTitle]);

  return (
    <EditorStylesContext.Provider value={{ color: actions.iconColor }}>
      <Helmet title={pageTitle}>
        <meta property="og:title" content={pageTitle} />
      </Helmet>
      <GlobalThemeStyles color={actions.iconColor} />
      {!isEmbed && (
        <EditorIcon
          icon={actions.icon ?? 'Deci'}
          color={actions.iconColor}
          onChangeIcon={actions.updateIcon}
          onChangeColor={actions.updateIconColor}
        />
      )}
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
    </EditorStylesContext.Provider>
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

  const [result] = useGetWorkspacesQuery();
  const { data: workspaceData } = result;

  const allWorkspaces = useMemo(
    () =>
      workspaceData?.workspaces?.map((workspace) => ({
        ...workspace,
        href: workspaces({}).workspace({
          workspaceId: workspace.id,
        }).$,
      })) ?? [],
    [workspaceData?.workspaces]
  );

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

  const [snapshotVersion, setSnapshotVersion] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    setSnapshotVersion((version) => {
      if (version) return;
      return (
        meta.data?.getPadById?.snapshots.find(
          (s) => s.snapshotName === SNAPSHOT_NAME
        )?.version ?? undefined
      );
    });
  }, [meta.data?.getPadById?.snapshots]);

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
    if (!meta.data?.getPadById?.isPublic || !docsync || !snapshotVersion)
      return;
    if (!docsync.isLoadedLocally || !docsync.isLoadedRemotely) return;

    setHasUnpublishedChanges(!docsync.equals(snapshotVersion));
  }, [docsync, snapshotVersion, meta.data?.getPadById?.isPublic]);

  useEffect(() => {
    const debouncedSub = docsync?.events.pipe(
      debounce(() => interval(DEBOUNCE_HAS_UNPUBLISHED_CHANGES_TIME_MS))
    );

    const sub = debouncedSub?.subscribe(() => {
      if (
        meta.data?.getPadById?.isPublic &&
        !(snapshotVersion && docsync?.equals(snapshotVersion))
      ) {
        setHasUnpublishedChanges(true);
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [
    docsync,
    docsync?.events,
    snapshotVersion,
    meta.data?.getPadById?.isPublic,
  ]);

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
      userWorkspaces={allWorkspaces}
      notebookMetaActions={actions}
      notebookAccessActions={accessActions}
      isNewNotebook={false}
      canUndo={canUndo}
      canRedo={canRedo}
      isEmbed={isEmbed}
      onRedo={() => docsync?.undoManager?.redo() || noop}
      onUndo={() => docsync?.undoManager?.undo() || noop}
      onClearAll={() => docsync?.clearAll()}
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

  const editor = useActiveEditor(docsync);

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

  const editor = useActiveEditor(docsync);

  const [isAssistantOpen] = useNotebookMetaData((state) => [state.aiMode]);

  const { embed: _embed } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  if (isAssistantOpen && !isEmbed && editor) {
    return <AssistantChat notebookId={notebookId} editor={editor} />;
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
