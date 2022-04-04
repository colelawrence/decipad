import { Editor } from '@decipad/editor';
import {
  PermissionType,
  useDuplicateNotebook,
  useGetNotebookById,
  useGetWorkspaces,
  useShareNotebookWithSecret,
  useUnshareNotebookWithSecret,
} from '@decipad/queries';
import { useToast } from '@decipad/react-contexts';
import {
  notebooks,
  useRouteParams,
  workspaces as workspacesRoute,
} from '@decipad/routing';
import { LoadingSpinnerPage, NotebookTopbar } from '@decipad/ui';
import styled from '@emotion/styled';
import { FC, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { getSecretNotebookLink } from '../lib/secret';
import { decode as decodeVanityUrlComponent } from '../lib/vanityUrlComponent';

const Wrapper = styled('div')({
  padding: '0 32px',
  display: 'grid',
});

const EditorWrapper = styled('div')({
  order: 2,
  width: 'min(100%, 120ch)',
  margin: 'auto',
});

const ErrorWrapper = styled('div')({
  height: '100%',
  display: 'grid',
  placeItems: 'center',
});

export const Notebook = (): ReturnType<FC> => {
  const history = useHistory();
  const params = useRouteParams(notebooks({}).notebook);
  const notebookId = decodeVanityUrlComponent(params.notebookId);

  // See if the route is a shared notebook or an owned one
  const { search } = useLocation();
  const secret = new URLSearchParams(search).get('secret') ?? undefined;

  const toast = useToast();

  // State
  const [sharingActive, setSharingActive] = useState(false);
  const [shareSecretKey, setShareSecretKey] = useState('');

  // Queries
  const { notebook, notebookReadOnly, notebookLoading } = useGetNotebookById(
    notebookId,
    secret
  );

  const { data: { workspaces } = {}, refetch: fetchWorkspaces } =
    useGetWorkspaces();

  // Mutations
  const [unshareNotebook] = useUnshareNotebookWithSecret(
    notebook?.id || '',
    notebook && notebook?.access.secrets.length > 0
      ? notebook?.access.secrets[0].secret
      : ''
  );
  const [shareNotebook] = useShareNotebookWithSecret(
    notebook?.id || '',
    PermissionType.READ
  );
  const [duplicateNotebook] = useDuplicateNotebook(
    notebook?.id || '',
    notebook?.workspace.id || '',
    secret || ''
  );

  // Set the share toggle button to be active if the notebook has secrets
  useEffect(() => {
    if (notebook && notebook.access.secrets.length > 0) {
      setSharingActive(true);
      setShareSecretKey(notebook.access.secrets[0].secret);
    } else {
      setSharingActive(false);
      setShareSecretKey('');
    }
  }, [notebook]);

  const notebookUrlWithSecret = getSecretNotebookLink(
    notebook?.id || '',
    notebook?.name || '',
    shareSecretKey
  );

  const onShareToggleClick = async () => {
    if (sharingActive) {
      unshareNotebook();
      setShareSecretKey('');
    } else {
      await shareNotebook();
    }
  };

  const onDuplicateNotebook = async () => {
    const [firstWorkspace] =
      workspaces ?? (await fetchWorkspaces({ asdf: 42 })).data.workspaces;
    const { errors } = await duplicateNotebook({
      // This callback cannot run from a render where notebook is not defined
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      variables: { id: notebook!.id, targetWorkspace: firstWorkspace.id },
    });

    if (errors) {
      toast(`Error duplicating notebook: ${errors[0].message}`, 'error');
    }

    history.push(
      workspacesRoute({}).workspace({ workspaceId: firstWorkspace.id }).$
    );
  };

  if (notebookLoading) {
    return <LoadingSpinnerPage />;
  }

  if (!notebook) {
    return (
      <ErrorWrapper>
        <h1 style={{ fontSize: '2rem' }}>Couldn't get the notebook</h1>
      </ErrorWrapper>
    );
  }

  return (
    <Wrapper>
      <EditorWrapper>
        <Editor
          notebookId={notebook?.id}
          readOnly={notebookReadOnly}
          authSecret={secret}
        />
      </EditorWrapper>
      <NotebookTopbar
        workspaceName={notebook.workspace.name}
        notebookName={
          notebook.name === '' ? '<unnamed-notebook>' : notebook.name
        }
        workspaceHref={
          workspacesRoute({}).workspace({ workspaceId: notebook.workspace.id })
            .$
        }
        usersWithAccess={notebook.access.users}
        permission={notebook.myPermissionType}
        link={notebookUrlWithSecret}
        sharingActive={sharingActive}
        onToggleShare={onShareToggleClick}
        onDuplicateNotebook={onDuplicateNotebook}
      />
    </Wrapper>
  );
};
