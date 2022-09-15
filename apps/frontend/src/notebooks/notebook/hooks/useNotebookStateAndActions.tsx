import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BehaviorSubject } from 'rxjs';
import { DocSyncEditor } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';
import { useToast } from '@decipad/toast';
import { parseIconColorFromIdentifier } from '../../../utils/parseIconColorFromIdentifier';
import {
  GetNotebookByIdQuery,
  useGetNotebookByIdQuery,
  useSetNotebookPublicMutation,
  useUpdateNotebookIconMutation,
} from '../../../graphql';
import { useDuplicateNotebook } from './useDuplicateNotebook';
import EditorIcon from '../EditorIcon';

type Icon = ComponentProps<typeof EditorIcon>['icon'];
type IconColor = ComponentProps<typeof EditorIcon>['color'];
export type Notebook = GetNotebookByIdQuery['getPadById'];

interface useNotebookStateAndActionsProps {
  readonly notebookId: string;
  readonly editor?: MyEditor;
  readonly docsync?: DocSyncEditor;
}
interface useNotebookStateAndActionsResult {
  error?: Error;
  notebook: Notebook | undefined;
  isReadOnly: boolean;
  isPublic: boolean;
  icon: Icon | undefined;
  iconColor: IconColor | undefined;
  hasLocalChanges: BehaviorSubject<boolean> | undefined;
  isSavedRemotely: BehaviorSubject<boolean> | undefined;

  duplicate: () => Promise<void>;
  removeLocalChanges: () => Promise<void>;
  updateIcon: (icon: Icon) => void;
  updateIconColor: (icon: IconColor) => void;
  setNotebookPublic: (isPublic: boolean) => void;
}

export const useNotebookStateAndActions = ({
  notebookId,
  editor,
  docsync,
}: useNotebookStateAndActionsProps): useNotebookStateAndActionsResult => {
  // ------- internal hooks -------
  const toast = useToast();

  // ------- state -------
  const [error, setError] = useState<Error | undefined>();
  const [notebook, setNotebook] = useState<Notebook | undefined>();
  const [icon, setIcon] = useState<Icon | undefined>();
  const [iconColor, setIconColor] = useState<IconColor>();
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
    variables: { id: notebookId },
  });
  const [remoteDuplicateNotebook] = useDuplicateNotebook({
    id: notebookId,
    editor,
  });
  const [, remoteUpdateNotebookIcon] = useUpdateNotebookIconMutation();
  const [, remoteUpdateNotebookIsPublic] = useSetNotebookPublicMutation();

  // ------- actions -------
  const duplicate = useCallback(async () => {
    await remoteDuplicateNotebook();
  }, [remoteDuplicateNotebook]);

  const removeLocalChanges = useCallback(async () => {
    await docsync?.removeLocalChanges();
    window.location.reload();
  }, [docsync]);

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
        }
      }
    },
    [
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
        }
      }
    },
    [
      icon,
      iconColor,
      notebook?.icon,
      notebookId,
      remoteUpdateNotebookIcon,
      toast,
    ]
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

  return {
    error,
    notebook,
    isReadOnly,
    isPublic,
    icon,
    iconColor,
    hasLocalChanges,
    isSavedRemotely,

    duplicate,
    removeLocalChanges,
    setNotebookPublic,
    updateIcon,
    updateIconColor,
  };
};
