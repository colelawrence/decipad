import { Computer } from '@decipad/computer';
import { DocSyncEditor } from '@decipad/docsync';
import { EditorSidebar } from '@decipad/editor-components';
import { MyEditor } from '@decipad/editor-types';
import {
  useFinishOnboarding,
  useGetWorkspacesIDsQuery,
  useRenameNotebookMutation,
} from '@decipad/graphql-client';
import {
  ComputerContextProvider,
  DeciEditorContextProvider,
  EditorChangeContextProvider,
  EditorStylesContext,
  EditorStylesContextValue,
  useCurrentWorkspaceStore,
} from '@decipad/react-contexts';
import { notebooks, useRouteParams } from '@decipad/routing';
import { isServerSideRendering } from '@decipad/support';
import {
  EditorPlaceholder,
  LoadingLogo,
  NotebookPage,
  TopbarPlaceholder,
  GlobalThemeStyles,
} from '@decipad/ui';
import { SelectedTab } from 'libs/ui/src/organisms/EditorSidebar/types';
import { FC, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { Subject } from 'rxjs';
import { ErrorPage, Frame, RequireSession } from '../../meta';
import Topbar from './Topbar';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { useExternalDataSources } from './hooks/useExternalDataSources';
import { useNotebookStateAndActions } from './hooks/useNotebookStateAndActions';
import { NotebookMetaActionsProvider } from '../../workspaces/workspace/providers';

export const loadEditor = () =>
  import(/* webpackChunkName: "notebook-editor" */ './Editor');
const Editor = lazy(loadEditor);

const Notebook: FC = () => {
  const [editor, setEditor] = useState<MyEditor | undefined>();
  const [docsync, setDocsync] = useState<DocSyncEditor | undefined>();

  const [sidebarTab, setSidebarTab] = useState<SelectedTab>('block');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [setSidebarOpen, sidebarOpen]);

  const { setCurrentWorkspaceInfo } = useCurrentWorkspaceStore();

  const {
    notebook: { id: notebookId },
    secret,
  } = useRouteParams(notebooks({}).notebook);

  const {
    error,
    notebook,
    initialState,
    connectionParams,
    hasLocalChanges,
    hasUnpublishedChanges,
    isReadOnly,
    isPublishing,
    icon,
    iconColor,
    isNew,
    notebookStatus,
    createdAt,
    updateIcon,
    updateIconColor,
    removeLocalChanges,
    publishNotebook,
    unpublishNotebook,
    inviteEditorByEmail,
    removeEditorById,
    changeEditorAccess,
    getAttachmentForm,
    onAttached,
  } = useNotebookStateAndActions({
    notebookId,
    editor,
    docsync,
  });

  const [userWorkspaces] = useGetWorkspacesIDsQuery();

  const [, renameNotebook] = useRenameNotebookMutation();

  const workspace = notebook?.workspace;
  const workspaceId = workspace?.id;

  useEffect(() => {
    setCurrentWorkspaceInfo({
      id: workspace?.id,
      isPremium: !!workspace?.isPremium,
      quotaLimit: workspace?.workspaceExecutedQuery?.quotaLimit,
      queryCount: workspace?.workspaceExecutedQuery?.queryCount,
    });
  }, [workspace, setCurrentWorkspaceInfo]);

  useAnimateMutations();
  useFinishOnboarding();

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

  const styles = useMemo<EditorStylesContextValue>(
    () => ({ color: iconColor }),
    [iconColor]
  );

  const [computer, setComputer] = useState<Computer>(new Computer());

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

  return (
    <NotebookMetaActionsProvider
      workspaceId={
        workspaceId || userWorkspaces.data?.workspaces?.[0]?.id || ''
      }
      isInArchive={Boolean(notebook?.archived)}
    >
      <DeciEditorContextProvider value={docsync}>
        <ComputerContextProvider computer={computer}>
          <EditorStylesContext.Provider value={styles}>
            <GlobalThemeStyles color={iconColor} />
            <Frame
              Heading="h1"
              title={notebook?.name ?? ''}
              suspenseFallback={<LoadingLogo />}
            >
              <NotebookPage
                sidebarOpen={sidebarOpen}
                icon={icon}
                iconColor={iconColor}
                onUpdateIcon={updateIcon}
                onUpdateIconColor={updateIconColor}
                notebook={
                  <Frame
                    Heading="h1"
                    title={null}
                    suspenseFallback={<EditorPlaceholder />}
                  >
                    <Editor
                      notebookMetaLoaded={notebook != null}
                      notebookTitle={notebook?.name ?? ''}
                      onNotebookTitleChange={onNotebookTitleChange}
                      notebookId={notebookId}
                      workspaceId={workspaceId}
                      readOnly={isReadOnly}
                      secret={secret}
                      connectionParams={connectionParams}
                      initialState={initialState}
                      onEditor={setEditor}
                      onDocsync={setDocsync}
                      onComputer={setComputer}
                      getAttachmentForm={getAttachmentForm}
                      onAttached={onAttached}
                      useExternalDataSources={useExternalDataSources}
                    />
                  </Frame>
                }
                sidebar={
                  isReadOnly ? null : (
                    <EditorSidebar
                      sidebarTab={sidebarTab}
                      setSidebarTab={setSidebarTab}
                      sidebarOpen={sidebarOpen}
                      setSidebarOpen={setSidebarOpen}
                    />
                  )
                }
                topbar={
                  <Frame
                    Heading="h1"
                    title={null}
                    suspenseFallback={<TopbarPlaceholder />}
                  >
                    <Topbar
                      workspaces={userWorkspaces.data?.workspaces ?? []}
                      notebook={notebook}
                      hasLocalChanges={hasLocalChanges}
                      isNewNotebook={isNew}
                      editor={editor}
                      hasUnpublishedChanges={hasUnpublishedChanges}
                      isPublishing={isPublishing}
                      removeLocalChanges={removeLocalChanges}
                      publishNotebook={publishNotebook}
                      unpublishNotebook={unpublishNotebook}
                      inviteEditorByEmail={inviteEditorByEmail}
                      removeEditorById={removeEditorById}
                      changeEditorAccess={changeEditorAccess}
                      toggleSidebar={toggleSidebar}
                      sidebarOpen={sidebarOpen}
                      status={notebookStatus}
                      isReadOnly={isReadOnly}
                      creationDate={createdAt}
                    />
                  </Frame>
                }
              />
            </Frame>
          </EditorStylesContext.Provider>
        </ComputerContextProvider>
      </DeciEditorContextProvider>
    </NotebookMetaActionsProvider>
  );
};

const ChangesNotebook: FC = () => {
  const [changeSubject] = useState(() => new Subject<undefined>());
  return (
    <EditorChangeContextProvider changeSubject={changeSubject}>
      <Notebook />
    </EditorChangeContextProvider>
  );
};

export default ChangesNotebook;
