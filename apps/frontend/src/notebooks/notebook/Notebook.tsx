import { Computer } from '@decipad/computer';
import { DocSyncEditor } from '@decipad/docsync';
import { EditorSidebar } from '@decipad/editor-components';
import { MyEditor } from '@decipad/editor-types';
import {
  useFinishOnboarding,
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
  NotebookPage,
  GlobalThemeStyles,
} from '@decipad/ui';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Subject } from 'rxjs';
import { ErrorPage, Frame, RequireSession } from '../../meta';
import Topbar from './Topbar';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { useNotebookStateAndActions } from './hooks/useNotebookStateAndActions';
import { NotebookMetaActionsProvider } from '../../workspaces/workspace/providers';
import { lazyLoad } from '@decipad/react-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import { ExternalDataSourcesProvider } from './providers';

export const loadEditor = () =>
  import(/* webpackChunkName: "notebook-editor" */ './Editor');
const Editor = lazyLoad(loadEditor);

const Notebook: FC = () => {
  const [editor, setEditor] = useState<MyEditor | undefined>();
  const [docsync, setDocsync] = useState<DocSyncEditor | undefined>();

  const { setCurrentWorkspaceInfo } = useCurrentWorkspaceStore();

  const {
    notebook: { id: notebookId },
    secret,
    embed: _embed,
  } = useRouteParams(notebooks({}).notebook);

  const embed = isFlagEnabled('EMBED') && _embed;

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
    workspaceMembers,
    externalData,
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
      workspaceId={workspaceId || ''}
      isInArchive={Boolean(notebook?.archived)}
    >
      <ExternalDataSourcesProvider externalData={externalData}>
        <DeciEditorContextProvider value={docsync}>
          <ComputerContextProvider computer={computer}>
            <EditorStylesContext.Provider value={styles}>
              <GlobalThemeStyles color={iconColor} />
              <NotebookPage
                icon={icon}
                iconColor={iconColor}
                onUpdateIcon={updateIcon}
                onUpdateIconColor={updateIconColor}
                isEmbed={embed}
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
                    />
                  </Frame>
                }
                sidebar={!isReadOnly && !embed && <EditorSidebar />}
                topbar={
                  <Topbar
                    notebook={notebook}
                    hasLocalChanges={hasLocalChanges}
                    isNewNotebook={isNew}
                    editor={editor}
                    hasUnpublishedChanges={hasUnpublishedChanges}
                    isPublishing={isPublishing}
                    usersFromTeam={workspaceMembers}
                    removeLocalChanges={removeLocalChanges}
                    publishNotebook={publishNotebook}
                    unpublishNotebook={unpublishNotebook}
                    inviteEditorByEmail={inviteEditorByEmail}
                    removeEditorById={removeEditorById}
                    changeEditorAccess={changeEditorAccess}
                    status={notebookStatus}
                    isReadOnly={isReadOnly}
                    creationDate={createdAt}
                  />
                }
              />
            </EditorStylesContext.Provider>
          </ComputerContextProvider>
        </DeciEditorContextProvider>
      </ExternalDataSourcesProvider>
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
