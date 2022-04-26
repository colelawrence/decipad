import { useMutation } from '@apollo/client';
import { Editor } from '@decipad/editor';
import {
  PermissionType,
  UpdateNotebookIcon,
  UpdateNotebookIconVariables,
  UPDATE_NOTEBOOK_ICON,
  useDuplicateNotebook,
  useGetNotebookById,
  useGetWorkspaces,
  useShareNotebookWithSecret,
  useUnshareNotebookWithSecret,
} from '@decipad/queries';
import {
  notebooks,
  useRouteParams,
  workspaces as workspacesRoute,
} from '@decipad/routing';
import { useToast } from '@decipad/toast';
import {
  EditorIcon,
  ErrorPage,
  LoadingSpinnerPage,
  NotebookPage,
  NotebookTopbar,
} from '@decipad/ui';
import Head from 'next/head';
import { ComponentProps, FC, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { getSecretNotebookLink } from '../lib/secret';
import { decode as decodeVanityUrlComponent } from '../lib/vanityUrlComponent';
import { parseIconColorFromIdentifier } from '../lib/parseIconColorFromIdentifier';

type Icon = ComponentProps<typeof EditorIcon>['icon'];
type IconColor = ComponentProps<typeof EditorIcon>['color'];

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
  const [icon, setIcon] = useState<Icon>('Rocket');
  const [iconColor, setIconColor] = useState<IconColor>('Catskill');

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

  const [updateNotebookIcon] = useMutation<
    UpdateNotebookIcon,
    UpdateNotebookIconVariables
  >(UPDATE_NOTEBOOK_ICON);

  // Set the share toggle button to be active if the notebook has secrets
  useEffect(() => {
    if (notebook && notebook.access.secrets.length > 0) {
      setSharingActive(true);
      setShareSecretKey(notebook.access.secrets[0].secret);
    } else {
      setSharingActive(false);
      setShareSecretKey('');
    }

    const { newIcon, newIconColor, ok } = parseIconColorFromIdentifier(
      notebook?.icon
    );

    if (ok && newIcon && newIconColor) {
      setIcon(newIcon as Icon);
      setIconColor(newIconColor as IconColor);
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
    <div>
      <Head>
        <title>
          {notebook.name ? notebook.name : 'Make sense of numbers'} — Decipad
        </title>
      </Head>
      <NotebookPage
        notebook={
          <Editor
            notebookId={notebookId}
            readOnly={notebookReadOnly}
            authSecret={secret}
          />
        }
        notebookIcon={
          <EditorIcon
            color={iconColor}
            icon={icon}
            onChangeIcon={(newIcon) => {
              setIcon(newIcon);
              updateNotebookIcon({
                variables: {
                  id: notebook.id,
                  icon: `${newIcon}-${iconColor}`,
                },
              });
            }}
            onChangeColor={(newIconColor) => {
              setIconColor(newIconColor);
              updateNotebookIcon({
                variables: {
                  id: notebook.id,
                  icon: `${icon}-${newIconColor}`,
                },
              });
            }}
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
    </div>
  );
};
