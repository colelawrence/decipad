import { createContext, useContext } from 'react';

export interface NotebookMetaActionsType {
  readonly onDeleteNotebook: (notebookId: string, showToast?: true) => void;
  readonly onUnarchiveNotebook: (notebookId: string, showToast?: true) => void;

  readonly onDownloadNotebook: (notebookId: string) => void;
  readonly onDownloadNotebookHistory: (notebookId: string) => void;

  readonly onMoveToSection: (notebookId: string, sectionId: string) => void;
  readonly onMoveToWorkspace: (notebookId: string, workspaceId: string) => void;

  readonly onChangeStatus: (notebookId: string, status: string) => void;

  readonly onDuplicateNotebook: (
    notebookId: string,
    navigateToNotebook?: true
  ) => Promise<boolean>;
}

export const NotebookMetaActions = createContext<
  NotebookMetaActionsType | undefined
>(undefined);

/**
 * Use Notebook Meta Actions to change meta data about a notebook.
 * This includes its section, download actions, archive etc...
 *
 * This should be available both withtin the workspace and notebook.
 */
export const useNotebookMetaActions = () => {
  const data = useContext(NotebookMetaActions);
  if (!data) {
    throw new Error('Used `useNotebookMetaActions` outside a provider');
  }
  return data;
};
