/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
import { ComponentProps, FC, useCallback, useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  PermissionType,
  UPDATE_NOTEBOOK_ICON,
  UpdateNotebookIcon,
  UpdateNotebookIconVariables,
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
  NotebookTopbar,
  ToastDisplay,
} from '@decipad/ui';
import Head from 'next/head';
import { useHistory } from 'react-router-dom';
import { Notebook } from '@decipad/notebook';
import { serializeDocument } from '@decipad/editor-utils';
import { DocSyncEditor } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';
import { parseIconColorFromIdentifier } from '../lib/parseIconColorFromIdentifier';

type Icon = ComponentProps<typeof EditorIcon>['icon'];
type IconColor = ComponentProps<typeof EditorIcon>['color'];

export const NotebookRoute = (): ReturnType<FC> => {
  const [editor, setEditor] = useState<MyEditor | undefined>();
  const [docsync, setDocsync] = useState<DocSyncEditor | undefined>();

  const history = useHistory();

  const {
    notebook: { id: notebookId },
    secret,
  } = useRouteParams(notebooks({}).notebook);

  const toast = useToast();

  // State
  const [sharingSecret, setSharingSecret] = useState('');
  const [icon, setIcon] = useState<Icon>('Rocket');
  const [iconColor, setIconColor] = useState<IconColor>('Catskill');

  // Queries
  const { notebook, notebookLoading, readOnly } = useGetNotebookById(
    notebookId,
    secret
  );

  const { data: { workspaces } = {}, refetch: fetchWorkspaces } =
    useGetWorkspaces();

  // Mutations
  const [unshareNotebook] = useUnshareNotebookWithSecret(
    notebookId,
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

  const onIconChange = useCallback(
    (newIcon: string) => {
      updateNotebookIcon({
        variables: {
          id: notebookId,
          icon: newIcon,
        },
      });
    },
    [notebookId, updateNotebookIcon]
  );

  const onIconColorChange = useCallback(
    (newIconColor: string) => {
      setIconColor(newIconColor as IconColor);
      updateNotebookIcon({
        variables: {
          id: notebookId,
          icon: `${icon}-${newIconColor}`,
        },
      });
    },
    [icon, notebookId, updateNotebookIcon]
  );

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

  const onShareToggleClick = useCallback(async () => {
    if (sharingSecret) {
      unshareNotebook();
      setSharingSecret('');
    } else {
      await shareNotebook();
    }
  }, [shareNotebook, sharingSecret, unshareNotebook]);

  const onDuplicateNotebook = useCallback(async () => {
    const [firstWorkspace] =
      workspaces ?? (await fetchWorkspaces({ asdf: 42 })).data.workspaces;

    if (!editor) {
      return;
    }
    const duplicateParams = {
      id: notebookId,
      targetWorkspace: firstWorkspace.id,
      document: serializeDocument(editor),
    };
    const { errors } = await duplicateNotebook({
      // This callback cannot run from a render where notebook is not defined
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      variables: duplicateParams,
    });

    if (errors) {
      toast(`Error duplicating notebook: ${errors[0].message}`, 'error');
    }

    history.push(
      workspacesRoute({}).workspace({ workspaceId: firstWorkspace.id }).$
    );
  }, [
    duplicateNotebook,
    editor,
    fetchWorkspaces,
    history,
    notebookId,
    toast,
    workspaces,
  ]);

  const onRevertChanges = useCallback(async () => {
    await docsync?.removeLocalChanges();
    window.location.reload();
  }, [docsync]);

  if (notebookLoading) {
    return <LoadingSpinnerPage />;
  }

  if (!notebook) {
    return <ErrorPage Heading="h1" wellKnown="404" authenticated />;
  }

  return (
    <>
      <Head>
        <title>
          {notebook.name ? notebook.name : 'Make sense of numbers'} — Decipad
        </title>
      </Head>
      <ToastDisplay>
        <Notebook
          notebookId={notebookId}
          readOnly={readOnly}
          secret={secret}
          onEditor={setEditor}
          onDocsync={setDocsync}
          icon={
            <EditorIcon
              readOnly={readOnly}
              color={iconColor}
              icon={icon}
              onChangeIcon={(newIcon) => {
                setIcon(newIcon as Icon);
                onIconChange(`${newIcon}-${iconColor}`);
              }}
              onChangeColor={onIconColorChange}
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
              hasLocalChanges={docsync?.hasLocalChanges()}
              onRevertChanges={onRevertChanges}
            />
          }
        ></Notebook>
      </ToastDisplay>
    </>
  );
};
