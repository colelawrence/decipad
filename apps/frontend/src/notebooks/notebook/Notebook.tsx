import { DocSyncEditor } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';
import {
  EditorStylesContext,
  EditorStylesContextValue,
  DeciEditorContextProvider,
  EditorChangeContextProvider,
} from '@decipad/react-contexts';
import { notebooks, useRouteParams } from '@decipad/routing';
import {
  EditorPlaceholder,
  LoadingLogo,
  NotebookIconPlaceholder,
  NotebookPage,
  TopbarPlaceholder,
} from '@decipad/ui';
import { FC, lazy, useCallback, useMemo, useState } from 'react';
import {
  useGetWorkspacesIDsQuery,
  useRenameNotebookMutation,
} from '@decipad/graphql-client';
import { Subject } from 'rxjs';
import { ErrorPage, Frame, RequireSession } from '../../meta';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { useExternalDataSources } from './hooks/useExternalDataSources';
import { useNotebookStateAndActions } from './hooks/useNotebookStateAndActions';

const loadTopbar = () =>
  import(/* webpackChunkName: "notebook-topbar" */ './Topbar');
const Topbar = lazy(loadTopbar);
const loadEditorIcon = () =>
  import(/* webpackChunkName: "notebook-editor-icon" */ './EditorIcon');
const EditorIcon = lazy(loadEditorIcon);
const loadEditor = () =>
  import(/* webpackChunkName: "notebook-editor" */ './Editor');
const Editor = lazy(loadEditor);

// prefetch
loadTopbar().then(loadEditorIcon).then(loadEditor);

const Notebook: FC = () => {
  const [editor, setEditor] = useState<MyEditor | undefined>();
  const [docsync, setDocsync] = useState<DocSyncEditor | undefined>();

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
    updateIcon,
    updateIconColor,
    duplicate,
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

  useAnimateMutations();

  const onNotebookTitleChange = useCallback(
    (newName: string) => {
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
    },
    [notebookId, renameNotebook]
  );

  const styles = useMemo(
    () => ({ color: iconColor }),
    [iconColor]
  ) as EditorStylesContextValue;

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
    <DeciEditorContextProvider value={docsync}>
      <EditorStylesContext.Provider value={styles}>
        <Frame
          Heading="h1"
          title={notebook?.name ?? ''}
          suspenseFallback={<LoadingLogo />}
        >
          <NotebookPage
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
                  readOnly={isReadOnly}
                  secret={secret}
                  connectionParams={connectionParams}
                  initialState={initialState}
                  onEditor={setEditor}
                  onDocsync={setDocsync}
                  getAttachmentForm={getAttachmentForm}
                  onAttached={onAttached}
                  useExternalDataSources={useExternalDataSources}
                />
              </Frame>
            }
            notebookIcon={
              <Frame
                Heading="h1"
                title={null}
                suspenseFallback={<NotebookIconPlaceholder />}
              >
                <EditorIcon
                  color={iconColor}
                  icon={icon ?? 'Rocket'}
                  onChangeIcon={updateIcon}
                  onChangeColor={updateIconColor}
                  readOnly={isReadOnly}
                />
              </Frame>
            }
            topbar={
              <Frame
                Heading="h1"
                title={null}
                suspenseFallback={<TopbarPlaceholder />}
              >
                <Topbar
                  userWorkspaces={userWorkspaces.data?.workspaces}
                  notebook={notebook}
                  hasLocalChanges={hasLocalChanges}
                  hasUnpublishedChanges={hasUnpublishedChanges}
                  isPublishing={isPublishing}
                  duplicateNotebook={duplicate}
                  removeLocalChanges={removeLocalChanges}
                  publishNotebook={publishNotebook}
                  unpublishNotebook={unpublishNotebook}
                  inviteEditorByEmail={inviteEditorByEmail}
                  removeEditorById={removeEditorById}
                  changeEditorAccess={changeEditorAccess}
                />
              </Frame>
            }
          />
        </Frame>
      </EditorStylesContext.Provider>
    </DeciEditorContextProvider>
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
