/* eslint-disable camelcase */
import type { Publish_State } from '@decipad/graphql-client';

export interface NotebookMetaActionsReturn {
  onDeleteNotebook: (notebookId: string, showToast?: true) => void;
  onUnarchiveNotebook: (notebookId: string, showToast?: true) => void;

  onDownloadNotebook: (notebookId: string) => void;
  onDownloadNotebookHistory: (notebookId: string) => Promise<void>;

  onMoveToSection: (notebookId: string, sectionId: string) => void;
  onMoveToWorkspace: (
    notebookId: string,
    workspaceId: string,
    fromWorkspaceId?: string
  ) => void;

  onChangeStatus: (notebookId: string, status: string) => void;

  onDuplicateNotebook: (
    notebookId: string,
    workspaceId: string,
    navigateToNotebook?: boolean
  ) => Promise<boolean>;

  onUpdatePublishState: (
    notebookId: string,
    publishState: Publish_State
  ) => Promise<void>;

  /**
   * Actually publish a snapshot to the backend.
   *
   * This means updating/creating a "snapshot" of the notebook,
   * that users will see when visiting.
   */
  onPublishNotebook: (notebookId: string) => Promise<void>;

  onUpdateAllowDuplicate: (
    notebookId: string,
    allowDuplicate: boolean
  ) => Promise<void>;
}
