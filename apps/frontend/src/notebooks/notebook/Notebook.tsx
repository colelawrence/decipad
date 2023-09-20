/* eslint-disable prefer-destructuring */
import { Computer } from '@decipad/computer';
import { DocSyncEditor } from '@decipad/docsync';
import { EditorSidebar } from '@decipad/editor-components';
import { MyEditor } from '@decipad/editor-types';
import {
  EditorNotebookFragment,
  useFinishOnboarding,
  useGetNotebookMetaQuery,
  useRenameNotebookMutation,
} from '@decipad/graphql-client';
import {
  ComputerContextProvider,
  DeciEditorContextProvider,
  EditorChangeContextProvider,
  useCurrentWorkspaceStore,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { notebooks, useRouteParams } from '@decipad/routing';
import { isNewNotebook as _isNewNotebook, clearNotebook } from '../../utils';
import { isServerSideRendering } from '@decipad/support';
import {
  EditorPlaceholder,
  NotebookPage,
  GlobalThemeStyles,
  TopbarPlaceholder,
  NotebookTopbar,
  EditorIcon,
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
import { Subject } from 'rxjs';
import { ErrorPage, RequireSession } from '../../meta';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { useNotebookStateAndActions } from './hooks/useNotebookStateAndActions';
import { lazyLoad } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { useEditorUndoState } from './hooks';
import { useNotebookAccessActions, useNotebookMetaActions } from '../../hooks';
import { useExternalEditorChange } from '@decipad/editor-hooks';
import { Helmet } from 'react-helmet';

export const loadEditor = () =>
  import(/* webpackChunkName: "notebook-editor" */ './Editor');
const Editor = lazyLoad(loadEditor);

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
  const [editor, setEditor] = useState<MyEditor | undefined>();
  const [computer, setComputer] = useState<Computer>(new Computer());
  const [error, setError] = useState<Error | undefined>(undefined);

  useAnimateMutations();
  useFinishOnboarding();

  if (error) {
    return getNotebookError(error);
  }

  return (
    <DeciEditorContextProvider value={docsync}>
      <DocsyncEditorProvider.Provider value={docsync}>
        <EditorProvider.Provider value={editor}>
          <ComputerContextProvider computer={computer}>
            <NotebookPage
              notebook={
                <Suspense fallback={<EditorPlaceholder />}>
                  <NewEditor
                    notebookId={notebookId}
                    setDocsync={setDocsync}
                    setEditor={setEditor}
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
              sidebar={<NewSidebar />}
              isEmbed={isEmbed}
            />
          </ComputerContextProvider>
        </EditorProvider.Provider>
      </DocsyncEditorProvider.Provider>
    </DeciEditorContextProvider>
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
  setEditor: (editor: MyEditor) => void;
  setComputer: (computer: Computer) => void;
  setError: (error: Error | undefined) => void;
}> = ({ notebookId, setDocsync, setEditor, setComputer, setError }) => {
  const editor = useContext(EditorProvider);
  const docsync = useContext(DocsyncEditorProvider);

  const actions = useNotebookStateAndActions({
    notebookId,
    editor,
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

  return (
    <>
      <GlobalThemeStyles color={actions.iconColor} />
      <Helmet title={`${actions.notebook?.name} | Decipad`}></Helmet>
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
        onEditor={setEditor}
        onDocsync={setDocsync}
        onComputer={setComputer}
        notebookMetaLoaded={actions.notebook != null}
        notebookTitle={actions.notebook?.name ?? ''}
        workspaceId={actions.notebook?.workspace?.id ?? ''}
        readOnly={actions.isReadOnly}
        connectionParams={actions.connectionParams}
        initialState={actions.initialState}
        getAttachmentForm={actions.getAttachmentForm}
        onAttached={actions.onAttached}
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
  const onNotebookTitleChange = useCallback(
    (newName: string) => {
      if (!isServerSideRendering()) {
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

  return onNotebookTitleChange;
}

const DEBOUNCE_HAS_UNPUBLISHED_CHANGES_TIME_MS = 1_000;
const SNAPSHOT_NAME = 'Published 1';

/**
 * Entire Topbar Wrapper.
 *
 * Responsible for loading topbar dependencies, and all its elements.
 */
const NewTopbar: FC<{ notebookId: string }> = ({ notebookId }) => {
  const editor = useContext(EditorProvider);
  const docsync = useContext(DocsyncEditorProvider);

  const actions = useNotebookMetaActions();
  const accessActions = useNotebookAccessActions();

  const sidebarData = useNotebookMetaData((state) => ({
    sidebarOpen: state.sidebarOpen,
    toggleSidebar: state.toggleSidebar,
    hasPublished: state.hasPublished,
  }));

  const [canUndo, canRedo] = useEditorUndoState(editor);

  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

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
    switch (meta.data?.getPadById?.myPermissionType) {
      case 'ADMIN':
      case 'WRITE': {
        const name = useNotebookMetaData.persist.getOptions().name;
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
  }, [meta.data?.getPadById?.myPermissionType, sidebarData]);

  const isPublic = meta.data?.getPadById?.isPublic;
  const snapshot = meta.data?.getPadById?.snapshots.find(
    (s) => s.snapshotName === SNAPSHOT_NAME
  );

  const [snapshotVersion, setSnapshotVersion] = useState(snapshot?.version);

  useEffect(() => {
    const sub = sidebarData.hasPublished.subscribe(() => {
      setSnapshotVersion(docsync?.getVersionChecksum());
    });
    return () => {
      sub.unsubscribe();
    };
  }, [docsync, sidebarData.hasPublished]);

  const hasUnpublishedChanges = useExternalEditorChange(
    editor,
    useCallback(() => {
      return isPublic && !(snapshotVersion && docsync?.equals(snapshotVersion));
    }, [docsync, isPublic, snapshotVersion]),
    {
      debounceTimeMs: DEBOUNCE_HAS_UNPUBLISHED_CHANGES_TIME_MS,
    }
  );

  const isNewNotebook = useMemo(
    () =>
      Boolean(
        meta.data?.getPadById?.initialState != null &&
          _isNewNotebook(meta.data.getPadById.initialState || '')
      ),
    [meta.data?.getPadById?.initialState]
  );

  if (!meta.data?.getPadById) {
    return <TopbarPlaceholder />;
  }

  return (
    <NotebookTopbar
      hasUnpublishedChanges={Boolean(hasUnpublishedChanges)}
      notebookMeta={meta.data?.getPadById}
      userWorkspaces={meta.data?.workspaces ?? []}
      notebookMetaActions={actions}
      notebookAccessActions={accessActions}
      isNewNotebook={isNewNotebook}
      canUndo={canUndo}
      canRedo={canRedo}
      isEmbed={isEmbed}
      onRedo={() => editor?.undoManager?.redo() || noop}
      onUndo={() => editor?.undoManager?.undo() || noop}
      onClearAll={() => editor && clearNotebook(editor)}
      sidebarOpen={sidebarData.sidebarOpen}
      toggleSidebar={sidebarData.toggleSidebar}
    />
  );
};

const NewSidebar: FC = () => {
  const [isSidebarOpen] = useNotebookMetaData((state) => [state.sidebarOpen]);

  const { embed: _embed } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  if (isSidebarOpen && !isEmbed) {
    return <EditorSidebar />;
  }

  return null;
};

const EditorProvider = createContext<MyEditor | undefined>(undefined);
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
