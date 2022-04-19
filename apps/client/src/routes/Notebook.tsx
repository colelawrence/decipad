import { Editor } from '@decipad/editor';
import {
  PermissionType,
  useDuplicateNotebook,
  useGetNotebookById,
  useGetWorkspaces,
  useShareNotebookWithSecret,
  useUnshareNotebookWithSecret,
} from '@decipad/queries';
import { useToast } from '@decipad/toast';
import {
  notebooks,
  useRouteParams,
  workspaces as workspacesRoute,
} from '@decipad/routing';
import {
  ErrorPage,
  LoadingSpinnerPage,
  NotebookPage,
  NotebookTopbar,
} from '@decipad/ui';
import { FC, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { getSecretNotebookLink } from '../lib/secret';
import { decode as decodeVanityUrlComponent } from '../lib/vanityUrlComponent';

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
    return <ErrorPage Heading="h1" wellKnown="404" authenticated />;
  }

  return (
    <NotebookPage
      notebook={
        <Editor
          notebookId={notebook?.id}
          readOnly={notebookReadOnly}
          authSecret={secret}
        />
      }
      topbar={
        <NotebookTopbar
          workspaceName={notebook.workspace.name}
          notebookName={
            notebook.name === '' ? '<unnamed-notebook>' : notebook.name
          }
          workspaceHref={
            workspacesRoute({}).workspace({
              workspaceId: notebook.workspace.id,
            }).$
          }
          usersWithAccess={notebook.access.users}
          permission={notebook.myPermissionType}
          link={notebookUrlWithSecret}
          sharingActive={sharingActive}
          onToggleShare={onShareToggleClick}
          onDuplicateNotebook={onDuplicateNotebook}
        />
      }
    />
  );
};
