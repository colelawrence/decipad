import { DocSyncEditor } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';
import { serializeDocument } from '@decipad/editor-utils';
import { Notebook } from '@decipad/notebook';
import { notebooks, useRouteParams } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import {
  ComponentProps,
  FC,
  lazy,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PermissionType,
  useDuplicateNotebookMutation,
  useGetNotebookByIdQuery,
  useGetWorkspacesIDsQuery,
  useRenameNotebookMutation,
  useSetNotebookPublicMutation,
  useShareNotebookWithSecretMutation,
  useUnshareNotebookWithSecretMutation,
  useUpdateNotebookIconMutation,
} from '../../graphql';
import { ErrorPage, Frame } from '../../meta';
import { parseIconColorFromIdentifier } from '../../utils/parseIconColorFromIdentifier';

const loadTopbar = () =>
  import(/* webpackChunkName: "editor-topbar" */ './Topbar');
const Topbar = lazy(loadTopbar);

const loadEditorIcon = () =>
  import(/* webpackChunkName: "editor-icon" */ './EditorIcon');
const EditorIcon = lazy(loadEditorIcon);

type Icon = ComponentProps<typeof EditorIcon>['icon'];
type IconColor = ComponentProps<typeof EditorIcon>['color'];

const NotebookPage: FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [editor, setEditor] = useState<MyEditor | undefined>();
  const [docsync, setDocsync] = useState<DocSyncEditor | undefined>();

  const {
    notebook: { id: notebookId },
    secret,
  } = useRouteParams(notebooks({}).notebook);

  const [result] = useGetNotebookByIdQuery({ variables: { id: notebookId } });

  const { data: notebookData, error: notebookError } = result;
  const notebook = notebookData?.getPadById;

  const isReadOnly = notebook?.myPermissionType === 'READ';

  // State
  const [sharingSecret, setSharingSecret] = useState('');
  const [isPublic, setIsPublic] = useState(notebook?.isPublic || false);
  const [icon, setIcon] = useState<Icon>('Rocket');
  const [iconColor, setIconColor] = useState<IconColor>('Catskill');

  const [, renameNotebook] = useRenameNotebookMutation();
  const [, updateNotebookIcon] = useUpdateNotebookIconMutation();
  const [, setNotebookPublic] = useSetNotebookPublicMutation();

  const [, unshareNotebookWithSecret] = useUnshareNotebookWithSecretMutation();
  const [, shareNotebook] = useShareNotebookWithSecretMutation();

  const handleIconChange = useCallback(
    (newIcon: string) => {
      updateNotebookIcon({
        id: notebookId,
        icon: newIcon,
      });
    },
    [notebookId, updateNotebookIcon]
  );

  const handleIconColorChange = useCallback(
    (newIconColor: string) => {
      setIconColor(newIconColor as IconColor);
      updateNotebookIcon({
        id: notebookId,
        icon: `${icon}-${newIconColor}`,
      });
    },
    [icon, notebookId, updateNotebookIcon]
  );

  // Set the share toggle button to be active if the notebook has secrets
  useEffect(() => {
    if (notebook && notebook?.access.secrets?.[0]?.secret) {
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

  const handleToggleSecretShare = useCallback(async () => {
    if (sharingSecret) {
      unshareNotebookWithSecret({
        id: notebookId,
        secret: sharingSecret,
      });
      setSharingSecret('');
    } else {
      await shareNotebook({
        id: notebookId,
        permissionType: notebook?.myPermissionType as PermissionType,
        canComment: false,
      });
    }
  }, [
    shareNotebook,
    sharingSecret,
    unshareNotebookWithSecret,
    notebookId,
    notebook?.myPermissionType,
  ]);

  const handleToggleMakePublic = useCallback(
    (newIsPublic: boolean) => setIsPublic(newIsPublic),
    []
  );

  const [workspaces] = useGetWorkspacesIDsQuery();
  const duplicateNotebook = useDuplicateNotebookMutation()[1];

  const handleDuplicateNotebook = useCallback(async () => {
    if (workspaces.data) {
      const [firstWorkspace] = workspaces.data.workspaces;

      if (!editor) {
        return;
      }
      try {
        const { data: duplicatedNotebookData, error } = await duplicateNotebook(
          {
            id: notebookId,
            targetWorkspace: firstWorkspace.id,
            document: serializeDocument(editor),
          }
        );
        if (error) {
          console.error('Failed to duplicate notebook. Error:', error);
          toast('Failed to duplicate notebook.', 'error');
        } else if (!duplicatedNotebookData) {
          console.error(
            'Failed to duplicate notebook. Received empty response.',
            error
          );
          toast('Failed to duplicate notebook.', 'error');
        } else {
          navigate(
            notebooks({}).notebook({
              notebook: duplicatedNotebookData.duplicatePad,
            }).$
          );
        }
      } catch (err) {
        console.error('Failed to duplicate notebook. Error:', err);
        toast('Failed to duplicate notebook.', 'error');
      }
    }
  }, [navigate, toast, duplicateNotebook, editor, notebookId, workspaces]);

  const handleRevertChanges = useCallback(async () => {
    await docsync?.removeLocalChanges();
    window.location.reload();
  }, [docsync]);

  useEffect(() => {
    if (
      notebook != null &&
      notebook.isPublic !== isPublic &&
      notebook.myPermissionType !== 'READ'
    ) {
      setNotebookPublic({ id: notebook.id, isPublic });
    }
  }, [isPublic, notebook, setNotebookPublic]);

  if (notebookError) {
    if (/no such/i.test(notebookError?.message))
      return <ErrorPage Heading="h1" wellKnown="404" />;
    throw notebookError;
  }
  if (!notebook) {
    throw new Error('Missing notebook');
  }

  // TODO lazy load Notebook
  return (
    <Frame Heading="h1" title={notebook.name}>
      <Notebook
        notebookTitle={notebook.name}
        onNotebookTitleChange={(newName) => {
          renameNotebook({
            id: notebook.id,
            name: newName,
          });
        }}
        notebookId={notebookId}
        readOnly={isReadOnly}
        secret={secret}
        onEditor={setEditor}
        onDocsync={setDocsync}
        icon={
          <EditorIcon
            color={iconColor}
            icon={icon}
            onChangeIcon={(newIcon) => {
              setIcon(newIcon as Icon);
              handleIconChange(`${newIcon}-${iconColor}`);
            }}
            onChangeColor={handleIconColorChange}
          />
        }
        topbar={
          <Frame Heading="h1" title={null}>
            <Topbar
              notebook={notebook}
              workspace={notebook.workspace}
              usersWithAccess={notebook.access.users}
              permission={notebook.myPermissionType}
              sharingSecret={sharingSecret}
              onToggleSecretShare={handleToggleSecretShare}
              onToggleMakePublic={handleToggleMakePublic}
              isPublic={notebook.isPublic || undefined}
              onRevertChanges={handleRevertChanges}
              onDuplicateNotebook={handleDuplicateNotebook}
            />
          </Frame>
        }
      />
    </Frame>
  );
};

export default NotebookPage;
