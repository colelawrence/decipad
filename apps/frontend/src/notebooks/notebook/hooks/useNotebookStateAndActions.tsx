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
import { isEmpty } from 'lodash';
import { ClientEventsContext } from '@decipad/client-events';
import { parseIconColorFromIdentifier } from '../../../utils/parseIconColorFromIdentifier';
import {
  GetNotebookByIdQuery,
  useCreateOrUpdateNotebookSnapshotMutation,
  useGetNotebookByIdQuery,
  useSetNotebookPublicMutation,
  useUpdateNotebookIconMutation,
  useSharePadWithEmailMutation,
} from '../../../graphql';
import { useDuplicateNotebook } from './useDuplicateNotebook';
import EditorIcon from '../EditorIcon';
import { PermissionType } from '../../../graphql/generated';

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
  inviteEditorByEmail: (email: string) => Promise<void>;
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
  const [error, setError] = useState<Error | undefined>();
  const [notebook, setNotebook] = useState<Notebook | undefined>();
  const [icon, setIcon] = useState<Icon | undefined>();
  const [iconColor, setIconColor] = useState<IconColor>(() => 'Sulu');
  const hasLocalChanges = useMemo(() => docsync?.hasLocalChanges(), [docsync]);
  const isSavedRemotely = useMemo(() => docsync?.isSavedRemotely(), [docsync]);
  const isReadOnly = useMemo(
    () => (notebook ? notebook.myPermissionType === 'READ' : true),
    [notebook]
  );
  const isPublic = useMemo(
    () => (notebook ? notebook.isPublic ?? false : false),
    [notebook]
  );

  // ------- remote api -------
  const [getNotebookResult] = useGetNotebookByIdQuery({
    variables: {
      id: notebookId,
      snapshotName: isReadOnly ? SNAPSHOT_NAME : undefined,
    },
  });
  const [remoteDuplicateNotebook] = useDuplicateNotebook({
    id: notebookId,
    editor,
  });
  const [, remoteUpdateNotebookIcon] = useUpdateNotebookIconMutation();
  const [, remoteUpdateNotebookIsPublic] = useSetNotebookPublicMutation();
  const [, shareNotebookWithEmail] = useSharePadWithEmailMutation();

  const [, createOrUpdateSnapshot] =
    useCreateOrUpdateNotebookSnapshotMutation();

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
    // set / unset notebook
    if (getNotebookResult.data !== notebook) {
      setNotebook(getNotebookResult.data?.getPadById);
    }
  }, [error, getNotebookResult, notebook]);

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

  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  // Grabbing the snapshot here so the effect can depend on it instead of the whole notebook. The
  // notebook appears to be a mutable reference from the local cache and so we'd miss effects.
  const snapshot = notebook?.snapshots[0];
  useEffect(() => {
    if (!docsync || !snapshot || !isPublic) {
      return;
    }

    const listener = () =>
      setHasUnpublishedChanges(
        !(snapshot?.version && docsync.equals(snapshot?.version))
      );

    // Trigger one initial run for good measure.
    if (!isEmpty(docsync.children)) {
      listener();
    }

    docsync.onSaved(listener);
    return () => docsync?.offSaved(listener);
  }, [docsync, isPublic, snapshot, setHasUnpublishedChanges]);

  const setNotebookPublic = useCallback(
    async (newIsPublic: boolean) => {
      await remoteUpdateNotebookIsPublic({
        id: notebookId,
        isPublic: newIsPublic,
      });
    },
    [notebookId, remoteUpdateNotebookIsPublic]
  );

  const publishNotebook = useCallback(() => {
    // TODO: this must invalidate the Pad since snapshots are a property of Pad. One way to do
    // this is if the mutation returns a Pad instead of a PadSnapshot. Another way to do it is to
    // programatically invalidate/update cache, either here or in the urql config.
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
    (email: string): Promise<void> => {
      // TODO: return a correct type instead of void
      // @ts-ignore
      return shareNotebookWithEmail({
        padId: notebookId,
        email,
        canComment: true,
        permissionType: PermissionType.Write,
      });
    },
    [notebookId, shareNotebookWithEmail]
  );

  return {
    error,
    notebook,
    isReadOnly,
    isPublic,
    icon,
    iconColor,
    hasLocalChanges,
    isSavedRemotely,
    connectionParams: notebook?.padConnectionParams,
    initialState: notebook?.initialState ?? undefined,
    hasUnpublishedChanges,

    duplicate,
    removeLocalChanges,
    setNotebookPublic,
    updateIcon,
    updateIconColor,

    publishNotebook,
    unpublishNotebook,
    inviteEditorByEmail,
  };
};
