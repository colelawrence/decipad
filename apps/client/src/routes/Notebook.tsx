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
import { EditorIsReadOnlyProvider } from '@decipad/react-contexts';
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
import { useHistory } from 'react-router-dom';
import { parseIconColorFromIdentifier } from '../lib/parseIconColorFromIdentifier';

type Icon = ComponentProps<typeof EditorIcon>['icon'];
type IconColor = ComponentProps<typeof EditorIcon>['color'];

export const Notebook = (): ReturnType<FC> => {
  const history = useHistory();
  const {
    notebook: { id },
    secret,
  } = useRouteParams(notebooks({}).notebook);

  const toast = useToast();

  // State
  const [sharingSecret, setSharingSecret] = useState('');
  const [icon, setIcon] = useState<Icon>('Rocket');
  const [iconColor, setIconColor] = useState<IconColor>('Catskill');

  // Queries
  const { notebook, notebookReadOnly, notebookLoading } = useGetNotebookById(
    id,
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
      setSharingSecret(notebook.access.secrets[0].secret);
    } else {
      setSharingSecret('');
    }

    const { newIcon, newIconColor, ok } = parseIconColorFromIdentifier(
      notebook?.icon
    );

    if (ok && newIcon && newIconColor) {
      setIcon(newIcon as Icon);
      setIconColor(newIconColor as IconColor);
    }
  }, [notebook]);

  const onShareToggleClick = async () => {
    if (sharingSecret) {
      unshareNotebook();
      setSharingSecret('');
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
    <EditorIsReadOnlyProvider isEditorReadOnly={notebookReadOnly}>
      <div>
        <Head>
          <title>
            {notebook.name ? notebook.name : 'Make sense of numbers'} — Decipad
          </title>
        </Head>
        <NotebookPage
          notebook={
            <Editor
              notebookId={id}
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
              workspace={notebook.workspace}
              notebook={notebook}
              usersWithAccess={notebook.access.users}
              permission={notebook.myPermissionType}
              sharingSecret={sharingSecret}
              onToggleShare={onShareToggleClick}
              onDuplicateNotebook={onDuplicateNotebook}
            />
          }
        />
      </div>
    </EditorIsReadOnlyProvider>
  );
};
