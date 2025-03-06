import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BehaviorSubject } from 'rxjs';
import type { DocSyncEditor } from '@decipad/docsync';
import { useToast } from '@decipad/toast';
import { analytics } from '@decipad/client-events';
import type { PermissionType as PermissionTypeStr } from 'libs/ui/src/types';
import type {
  GetNotebookByIdQuery,
  PermissionType,
} from '@decipad/graphql-client';
import {
  useGetNotebookByIdQuery,
  useUpdateNotebookIconMutation,
  useAttachFileToNotebookMutation,
  useGetCreateAttachmentFormMutation,
  useSharePadWithEmailMutation,
  useUnsharePadWithUserMutation,
  useUpdatePadPermissionMutation,
  useCreateNotebookSnapshotMutation,
  useSetNotebookPublishStateMutation,
  useUpdateNotebookNumberFormattingMutation,
} from '@decipad/graphql-client';
import type EditorIcon from '../EditorIcon';
import type { TColorStatus } from '@decipad/ui';
import {
  isNewNotebook,
  parseIconColorFromIdentifier,
} from 'apps/frontend/src/utils';
import { useExternalDataSources } from './useExternalDataSources';
import type { ExternalDataSourcesContextValue } from '@decipad/interfaces';
import { NumberFormatting } from '@decipad/editor-types';
import { timeout } from '@decipad/utils';

type Icon = ComponentProps<typeof EditorIcon>['icon'];
type IconColor = ComponentProps<typeof EditorIcon>['color'];
export type Notebook = GetNotebookByIdQuery['getPadById'];

interface useNotebookStateAndActionsProps {
  readonly notebookId: string;
  readonly docsync: DocSyncEditor | undefined;
}

interface NotebookConnectionParams {
  url: string;
  token: string;
}

interface AiUsage {
  promptTokensUsed: number;
  completionTokensUSed: number;
}
interface Users {
  aiUsage: AiUsage;
}

interface UserAccess {
  id: string;
  users: Users[];
}

interface UseNotebookStateAndActionsResult {
  error?: Error;
  notebook: Notebook | undefined;
  isReadOnly: boolean;
  isPublic: boolean;
  icon: Icon | undefined;
  iconColor: IconColor;
  numberFormatting: NumberFormatting | undefined;
  hasLocalChanges: BehaviorSubject<boolean> | undefined;
  isSavedRemotely: BehaviorSubject<boolean> | undefined;
  connectionParams?: NotebookConnectionParams;
  initialState?: string;
  notebookStatus: TColorStatus;
  createdAt: Date;
  isNew: boolean;
  externalData: ExternalDataSourcesContextValue;
  access?: UserAccess;

  removeLocalChanges: () => Promise<void>;
  updateIcon: (icon: Icon) => void;
  updateIconColor: (icon: IconColor) => void;
  setNumberFormatting: (formatting: NumberFormatting | undefined) => void;
  setNotebookPublic: (isPublic: boolean) => void;
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
  onCreateSnapshot: () => void;
}

export const useNotebookStateAndActions = ({
  notebookId,
  docsync,
}: useNotebookStateAndActionsProps): UseNotebookStateAndActionsResult => {
  // ------- internal hooks -------
  const toast = useToast();

  // ------- state -------
  const [error, setError] = useState<Error | undefined>();

  const [getNotebookResult] = useGetNotebookByIdQuery({
    variables: {
      id: notebookId,
    },
  });
  const notebook = getNotebookResult.data?.getPadById;

  const externalData = useExternalDataSources(notebookId);

  const notebookStatus = (notebook?.status as TColorStatus) || 'Draft';

  // Icon.
  // We need to have local state, because otherwise even updating cache,
  // feels super slow.
  const { icon, iconColor } = parseIconColorFromIdentifier(notebook?.icon);
  const [cacheIcon, setCacheIcon] = useState(icon);
  const [cacheIconColor, setCacheIconColor] = useState(iconColor);

  const numberFormatting = (notebook?.numberFormatting || undefined) as
    | NumberFormatting
    | undefined;

  const hasLocalChanges = useMemo(() => docsync?.hasLocalChanges(), [docsync]);
  const isSavedRemotely = useMemo(() => docsync?.isSavedRemotely(), [docsync]);
  const isReadOnly = useMemo(
    () =>
      notebook
        ? !notebook.myPermissionType || notebook.myPermissionType === 'READ'
        : true,
    [notebook]
  );
  const isPublic = useMemo(
    () => (notebook ? notebook.isPublic ?? false : false),
    [notebook]
  );

  const isNew = useMemo(
    () => notebook != null && isNewNotebook(notebook?.initialState || ''),
    [notebook]
  );

  // ------- remote api -------
  const [, remoteUpdateNotebookIcon] = useUpdateNotebookIconMutation();
  const [, remoteUpdateNotebookPublishState] =
    useSetNotebookPublishStateMutation();
  const [, shareNotebookWithEmail] = useSharePadWithEmailMutation();
  const [, updatePadPermission] = useUpdatePadPermissionMutation();
  const [, unsharePadWithUser] = useUnsharePadWithUserMutation();
  const [, createSnapshot] = useCreateNotebookSnapshotMutation();
  const [, updateNotebookNumberFormatting] =
    useUpdateNotebookNumberFormattingMutation();

  const onCreateSnapshot = useCallback(() => {
    createSnapshot({
      notebookId,
    });
  }, [createSnapshot, notebookId]);

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

  // ------- actions -------
  const removeLocalChanges = useCallback(async () => {
    await docsync?.removeLocalChanges();
    analytics.track({
      type: 'action',
      action: 'notebook local changes removed',
    });
    await timeout(1_000);
    window.location.reload();
  }, [docsync]);

  // ------- effects -------
  useEffect(() => {
    // set / unset error
    if (getNotebookResult.error !== error) {
      setError(getNotebookResult.error);
    }
  }, [error, getNotebookResult]);

  // -------- user callbacks -------------
  const updateIcon = useCallback(
    (newIcon: Icon) => {
      if (!iconColor) return;

      setCacheIcon(newIcon);

      const iconString = `${newIcon}-${iconColor}`;
      if (iconString !== notebook?.icon) {
        remoteUpdateNotebookIcon({
          id: notebookId,
          icon: iconString,
        }).catch((err) => {
          toast(`Error updating icon: ${(err as Error).message}`, 'error');
        });
        analytics.track({
          type: 'action',
          action: 'notebook icon changed',
        });
      }
    },
    [iconColor, notebook?.icon, notebookId, remoteUpdateNotebookIcon, toast]
  );

  const updateIconColor = useCallback(
    (newIconColor: IconColor) => {
      if (!icon) return;

      setCacheIconColor(newIconColor);

      const iconString = `${icon}-${newIconColor}`;
      if (iconString !== notebook?.icon) {
        remoteUpdateNotebookIcon({
          id: notebookId,
          icon: iconString,
        }).catch((err) => {
          toast(`Error updating icon: ${(err as Error).message}`, 'error');
        });
        analytics.track({
          type: 'action',
          action: 'notebook icon color changed',
        });
      }
    },
    [icon, notebook?.icon, notebookId, remoteUpdateNotebookIcon, toast]
  );

  const setNumberFormatting = useCallback(
    async (formatting: NumberFormatting | undefined) => {
      await updateNotebookNumberFormatting({
        id: notebookId,
        numberFormatting: formatting || '',
      });
    },
    [notebookId, updateNotebookNumberFormatting]
  );

  // -------- publishing -------------

  const setNotebookPublic = useCallback(
    async (newIsPublic: boolean) => {
      await remoteUpdateNotebookPublishState({
        id: notebookId,
        publishState: newIsPublic ? 'PUBLIC' : 'PRIVATE',
      });
    },
    [notebookId, remoteUpdateNotebookPublishState]
  );

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
    error:
      error ??
      getNotebookResult.error?.graphQLErrors?.[0] ??
      getNotebookResult.error,
    notebook,
    isReadOnly,
    isPublic,
    icon: cacheIcon,
    iconColor: cacheIconColor,
    numberFormatting,
    hasLocalChanges,
    isSavedRemotely,
    connectionParams: notebook?.padConnectionParams,
    initialState: notebook?.initialState ?? undefined,
    notebookStatus,
    externalData,
    isNew,
    removeLocalChanges,
    setNotebookPublic,
    updateIcon,
    updateIconColor,
    setNumberFormatting,
    createdAt: new Date(notebook?.createdAt),
    changeEditorAccess,
    inviteEditorByEmail,
    removeEditorById,
    getAttachmentForm,
    onAttached,
    onCreateSnapshot,
  };
};
