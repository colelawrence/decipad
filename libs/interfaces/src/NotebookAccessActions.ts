export type PermissionType = 'ADMIN' | 'READ' | 'WRITE';

export interface NotebookAccessActionsReturn {
  onInviteByEmail: (
    notebookId: string,
    email: string,
    permission: PermissionType
  ) => Promise<void>;
  onChangeAccess: (
    notebookId: string,
    userId: string,
    permission: PermissionType
  ) => Promise<void>;
  onRemoveAccess: (notebookId: string, userId: string) => Promise<void>;
}
