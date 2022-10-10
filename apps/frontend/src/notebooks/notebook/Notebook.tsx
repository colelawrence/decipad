import { DocSyncEditor } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';
import { notebooks, useRouteParams } from '@decipad/routing';
import {
  EditorPlaceholder,
  LoadingLogo,
  NotebookIconPlaceholder,
  NotebookPage,
  TopbarPlaceholder,
} from '@decipad/ui';
import { FC, lazy, useState } from 'react';
import { useRenameNotebookMutation } from '../../graphql';
import { ErrorPage, Frame } from '../../meta';
import { useAnimateMutations } from './hooks/useAnimateMutations';
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
    isReadOnly,
    isPublic,
    icon,
    iconColor,
    updateIcon,
    updateIconColor,
    duplicate,
    removeLocalChanges,
    setNotebookPublic,
  } = useNotebookStateAndActions({
    notebookId,
    editor,
    docsync,
  });

  const [, renameNotebook] = useRenameNotebookMutation();

  useAnimateMutations();

  if (error) {
    if (/no such/i.test(error?.message))
      return <ErrorPage Heading="h1" wellKnown="404" />;
    if (/forbidden/i.test(error?.message)) {
      return <ErrorPage Heading="h1" wellKnown="403" />;
    }
    throw error;
  }

  return (
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
              notebookTitle={notebook?.name ?? ''}
              onNotebookTitleChange={(newName) => {
                renameNotebook({
                  id: notebookId,
                  name: newName,
                });
              }}
              notebookId={notebookId}
              readOnly={isReadOnly}
              secret={secret}
              connectionParams={connectionParams}
              initialState={initialState}
              onEditor={setEditor}
              onDocsync={setDocsync}
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
              color={iconColor ?? 'Catskill'}
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
              notebookId={notebookId}
              notebook={notebook}
              isNotebookPublic={isPublic}
              hasLocalChanges={hasLocalChanges}
              duplicateNotebook={duplicate}
              removeLocalChanges={removeLocalChanges}
              setNotebookPublic={setNotebookPublic}
            />
          </Frame>
        }
      />
    </Frame>
  );
};

export default Notebook;
