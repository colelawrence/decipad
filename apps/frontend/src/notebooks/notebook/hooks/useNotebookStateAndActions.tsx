import {
  ComponentProps,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BehaviorSubject } from 'rxjs';
import { DocSyncEditor } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';
import { useToast } from '@decipad/toast';
import { ClientEventsContext } from '@decipad/client-events';
import { PermissionType as PermissionTypeStr } from 'libs/ui/src/types';
import {
  GetNotebookByIdQuery,
  useCreateOrUpdateNotebookSnapshotMutation,
  useGetNotebookByIdQuery,
  useSetNotebookPublicMutation,
  useUpdateNotebookIconMutation,
  useAttachFileToNotebookMutation,
  useGetCreateAttachmentFormMutation,
  useSharePadWithEmailMutation,
  useUnsharePadWithUserMutation,
  useUpdatePadPermissionMutation,
  PermissionType,
} from '@decipad/graphql-client';
import { useExternalEditorChange } from '@decipad/editor-hooks';
import { parseIconColorFromIdentifier } from '../../../utils/parseIconColorFromIdentifier';
import { useDuplicateNotebook } from './useDuplicateNotebook';
import EditorIcon from '../EditorIcon';

const DEBOUNCE_HAS_UNPUBLISHED_CHANGES_TIME_MS = 1_000;

type Icon = ComponentProps<typeof EditorIcon>['icon'];
type IconColor = ComponentProps<typeof EditorIcon>['color'];
export type Notebook = GetNotebookByIdQuery['getPadById'];

interface useNotebookStateAndActionsProps {
  readonly notebookId: string;
  readonly editor?: MyEditor;
  readonly docsync?: DocSyncEditor;
}

interface NotebookConnectionParams {
  url: string;
  token: string;
}
interface UseNotebookStateAndActionsResult {
  error?: Error;
  notebook: Notebook | undefined;
  isReadOnly: boolean;
  isPublic: boolean;
  isPublishing?: boolean;
  icon: Icon | undefined;
  iconColor: IconColor;
  hasLocalChanges: BehaviorSubject<boolean> | undefined;
  isSavedRemotely: BehaviorSubject<boolean> | undefined;
  connectionParams?: NotebookConnectionParams;
  initialState?: string;
  hasUnpublishedChanges: boolean;

  duplicate: () => Promise<void>;
  removeLocalChanges: () => Promise<void>;
  updateIcon: (icon: Icon) => void;
  updateIconColor: (icon: IconColor) => void;
  setNotebookPublic: (isPublic: boolean) => void;
  publishNotebook: () => void;
  unpublishNotebook: () => void;
  inviteEditorByEmail: (
    email: string,
    permission: PermissionTypeStr
  ) => Promise<void>;
  changeEditorAccess: (
    editorId: string,
    permission: PermissionTypeStr
  ) => Promise<void>;
  removeEditorById: (id: string) => Promise<void>;
  getAttachmentForm: (
    file: File
  ) => Promise<undefined | [URL, FormData, string]>;
  onAttached: (handle: string) => Promise<undefined | { url: URL }>;
}

const SNAPSHOT_NAME = 'Published 1';

export const useNotebookStateAndActions = ({
  notebookId,
  editor,
  docsync,
}: useNotebookStateAndActionsProps): UseNotebookStateAndActionsResult => {
  // ------- internal hooks -------
  const toast = useToast();

  // ------- state -------
  const [getNotebookResult] = useGetNotebookByIdQuery({
    variables: {
      id: notebookId,
    },
  });
  const notebook = getNotebookResult.data?.getPadById;
  const [error, setError] = useState<Error | undefined>();
  const [icon, setIcon] = useState<Icon | undefined>();
  const [iconColor, setIconColor] = useState<IconColor>(() => 'Catskill');
  const hasLocalChanges = useMemo(() => docsync?.hasLocalChanges(), [docsync]);
  const isSavedRemotely = useMemo(() => docsync?.isSavedRemotely(), [docsync]);
  const isReadOnly = useMemo(
    () => (notebook ? notebook.myPermissionType === 'READ' : false),
    [notebook]
  );
  const isPublic = useMemo(
    () => (notebook ? notebook.isPublic ?? false : false),
    [notebook]
  );

  // ------- remote api -------
  const [remoteDuplicateNotebook] = useDuplicateNotebook({
    id: notebookId,
    editor,
  });
  const [, remoteUpdateNotebookIcon] = useUpdateNotebookIconMutation();
  const [, remoteUpdateNotebookIsPublic] = useSetNotebookPublicMutation();
  const [, shareNotebookWithEmail] = useSharePadWithEmailMutation();
  const [, updatePadPermission] = useUpdatePadPermissionMutation();
  const [, unsharePadWithUser] = useUnsharePadWithUserMutation();

  const [, createOrUpdateSnapshot] =
    useCreateOrUpdateNotebookSnapshotMutation();

  // ------- attachments -------
  const [, getCreateAttachmentForm] = useGetCreateAttachmentFormMutation();
  const getAttachmentForm = useCallback(
    async (file: File): Promise<undefined | [URL, FormData, string]> => {
      const result = await getCreateAttachmentForm({
        notebookId,
        fileName: file.name,
        fileType: file.type,
      });

      const form = result.data?.getCreateAttachmentForm;
      if (!form) {
        return;
      }
      const url = new URL(form.url);
      const formData = new FormData();
      for (const { key, value } of form.fields) {
        formData.set(key, value);
      }
      return [url, formData, form.handle];
    },
    [getCreateAttachmentForm, notebookId]
  );
  const [, attachFileToNotebook] = useAttachFileToNotebookMutation();
  const onAttached = useCallback(
    async (handle: string) => {
      const resp = await attachFileToNotebook({ handle });
      if (resp.error) {
        throw new Error(resp.error.message);
      }
      const urlString = resp.data?.attachFileToPad?.url;
      if (!urlString) {
        return;
      }
      const url = new URL(urlString);
      return {
        url,
      };
    },
    [attachFileToNotebook]
  );

  // ------- analytics -------
  const event = useContext(ClientEventsContext);

  // ------- actions -------
  const duplicate = useCallback(async () => {
    await remoteDuplicateNotebook();
    event({ type: 'action', action: 'notebook duplicated' });
  }, [remoteDuplicateNotebook, event]);

  const removeLocalChanges = useCallback(async () => {
    await docsync?.removeLocalChanges();
    await event({ type: 'action', action: 'notebook local changes removed' });
    window.location.reload();
  }, [docsync, event]);

  // ------- effects -------
  useEffect(() => {
    // set / unset error
    if (getNotebookResult.error !== error) {
      setError(getNotebookResult.error);
    }
  }, [error, getNotebookResult]);

  useEffect(() => {
    if (notebook) {
      const { icon: remoteIcon, iconColor: remoteIconColor } =
        parseIconColorFromIdentifier(notebook.icon);
      if (remoteIcon && icon !== remoteIcon) {
        setIcon(remoteIcon);
      }
      if (remoteIconColor && remoteIconColor !== iconColor) {
        setIconColor(remoteIconColor);
      }
    }
  }, [icon, iconColor, notebook]);

  // -------- user callbacks -------------
  const updateIcon = useCallback(
    (newIcon: Icon) => {
      if (newIcon !== icon) {
        setIcon(newIcon);
      }
      if (iconColor) {
        const iconString = `${newIcon}-${iconColor}`;
        if (iconString !== notebook?.icon) {
          remoteUpdateNotebookIcon({
            id: notebookId,
            icon: iconString,
          }).catch((err) => {
            toast(`Error updating icon: ${(err as Error).message}`, 'error');
          });
          event({ type: 'action', action: 'notebook icon changed' });
        }
      }
    },
    [
      event,
      icon,
      iconColor,
      notebook?.icon,
      notebookId,
      remoteUpdateNotebookIcon,
      toast,
    ]
  );

  const updateIconColor = useCallback(
    (newIconColor: IconColor) => {
      if (newIconColor !== iconColor) {
        setIconColor(newIconColor);
      }
      if (icon) {
        const iconString = `${icon}-${newIconColor}`;
        if (iconString !== notebook?.icon) {
          remoteUpdateNotebookIcon({
            id: notebookId,
            icon: iconString,
          }).catch((err) => {
            toast(`Error updating icon: ${(err as Error).message}`, 'error');
          });
          event({ type: 'action', action: 'notebook icon color changed' });
        }
      }
    },
    [
      event,
      icon,
      iconColor,
      notebook?.icon,
      notebookId,
      remoteUpdateNotebookIcon,
      toast,
    ]
  );

  // -------- publishing -------------

  const snapshot = notebook?.snapshots.find(
    (s) => s.snapshotName === SNAPSHOT_NAME
  );

  const hasUnpublishedChanges = useExternalEditorChange(
    editor,
    useCallback(() => {
      return (
        isPublic && !(snapshot?.version && docsync?.equals(snapshot?.version))
      );
    }, [docsync, isPublic, snapshot?.version]),
    {
      debounceTimeMs: DEBOUNCE_HAS_UNPUBLISHED_CHANGES_TIME_MS,
    }
  );

  const setNotebookPublic = useCallback(
    async (newIsPublic: boolean) => {
      await remoteUpdateNotebookIsPublic({
        id: notebookId,
        isPublic: newIsPublic,
      });
    },
    [notebookId, remoteUpdateNotebookIsPublic]
  );

  const [isPublishing, setIsPublishing] = useState(false);

  const publishNotebook = useCallback(() => {
    setIsPublishing(true);
    // TODO: this must invalidate the Pad since snapshots are a property of Pad. One way to do
    // this is if the mutation returns a Pad instead of a PadSnapshot. Another way to do it is to
    // programmatically invalidate/update cache, either here or in the urql config.
    createOrUpdateSnapshot({ notebookId, snapshotName: SNAPSHOT_NAME })
      .then((ret) => {
        if (ret.error) {
          console.error(`Error publishing notebook: ${ret.error.message}`);
          toast('Error publishing notebook', 'error');
          return;
        }
        return setNotebookPublic(true).then(() => {
          event({
            type: 'action',
            action: 'publish notebook',
            props: { id: notebookId },
          });
        });
      })
      .catch((err) => {
        console.error(err);
        toast('Error publishing notebook', 'error');
      })
      .finally(() => {
        setTimeout(
          () => setIsPublishing(false),
          DEBOUNCE_HAS_UNPUBLISHED_CHANGES_TIME_MS * 2
        );
      });
  }, [createOrUpdateSnapshot, event, notebookId, setNotebookPublic, toast]);

  const unpublishNotebook = useCallback(() => {
    setNotebookPublic(false).then(() => {
      event({
        type: 'action',
        action: 'unpublish notebook',
        props: { id: notebookId },
      });
    });
  }, [event, notebookId, setNotebookPublic]);

  const inviteEditorByEmail = useCallback(
    (email: string, permission: PermissionTypeStr): Promise<void> => {
      // TODO: return a correct type instead of void
      // @ts-ignore
      return shareNotebookWithEmail({
        padId: notebookId,
        email,
        canComment: true,
        permissionType: permission as unknown as PermissionType,
      });
    },
    [notebookId, shareNotebookWithEmail]
  );

  const changeEditorAccess = useCallback(
    (userId: string, permission: PermissionTypeStr): Promise<void> => {
      // TODO: return a correct type instead of void
      // @ts-ignore
      return updatePadPermission({
        padId: notebookId,
        userId,
        canComment: true,
        permissionType: permission as unknown as PermissionType,
      });
    },
    [notebookId, updatePadPermission]
  );

  const removeEditorById = useCallback(
    (userId: string): Promise<void> => {
      // TODO: return a correct type instead of void
      // @ts-ignore
      return unsharePadWithUser({
        userId,
        padId: notebookId,
      });
    },
    [notebookId, unsharePadWithUser]
  );

  return {
    error,
    notebook,
    isReadOnly,
    isPublic,
    isPublishing,
    icon,
    iconColor,
    hasLocalChanges,
    isSavedRemotely,
    connectionParams: notebook?.padConnectionParams,
    initialState: notebook?.initialState ?? undefined,
    hasUnpublishedChanges: !!hasUnpublishedChanges,
    duplicate,
    removeLocalChanges,
    setNotebookPublic,
    updateIcon,
    updateIconColor,

    publishNotebook,
    unpublishNotebook,
    changeEditorAccess,
    inviteEditorByEmail,
    removeEditorById,
    getAttachmentForm,
    onAttached,
  };
};
