import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { Subject } from 'rxjs';
import { isE2E } from '@decipad/utils';

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

export type SelectedTab = 'variable' | 'block';

export interface NotebookMetaDataType {
  readonly sidebarOpen: boolean;
  readonly toggleSidebar: () => void;
  readonly sidebarTab: SelectedTab;
  readonly setSidebarTab: (tab: SelectedTab) => void;

  // More technical stuff
  readonly hasPublished: Subject<undefined>;
}

export const useNotebookMetaData = create<NotebookMetaDataType>()(
  persist(
    (set) => {
      return {
        sidebarOpen: isE2E(),
        toggleSidebar() {
          set(({ sidebarOpen }) => ({ sidebarOpen: !sidebarOpen }));
        },

        sidebarTab: 'block',
        setSidebarTab(sidebarTab) {
          set(() => ({ sidebarTab }));
        },

        hasPublished: new Subject(),
      };
    },
    {
      name: 'notebook-ui-meta',
      partialize(state) {
        return Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['hasPublished'].includes(key)
          )
        );
      },
      skipHydration: true,
    }
  )
);
