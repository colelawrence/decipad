export interface NotebookMetaActionsReturn {
  onDeleteNotebook: (notebookId: string, showToast?: true) => void;
  onUnarchiveNotebook: (notebookId: string, showToast?: true) => void;

  onDownloadNotebook: (notebookId: string) => void;
  onDownloadNotebookHistory: (notebookId: string) => void;

  onMoveToSection: (notebookId: string, sectionId: string) => void;
  onMoveToWorkspace: (notebookId: string, workspaceId: string) => void;

  onChangeStatus: (notebookId: string, status: string) => void;

  onDuplicateNotebook: (
    notebookId: string,
    navigateToNotebook?: boolean,
    workspaceId?: string
  ) => Promise<boolean>;

  onPublishNotebook: (notebookId: string) => Promise<void>;
  onUnpublishNotebook: (notebookId: string) => Promise<void>;
}
