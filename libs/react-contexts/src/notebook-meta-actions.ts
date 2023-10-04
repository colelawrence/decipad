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
    navigateToNotebook?: boolean,
    workspaceId?: string
  ) => Promise<boolean>;
}

export type SelectedTab = 'variable' | 'block';

export interface NotebookMetaDataType {
  readonly sidebarOpen: boolean;
  readonly toggleSidebar: () => void;
  readonly sidebarTab: SelectedTab;
  readonly setSidebarTab: (tab: SelectedTab) => void;
  readonly aiMode: boolean;
  readonly toggleAIMode: () => void;

  // More technical stuff
  readonly hasPublished: Subject<undefined>;
}

export const useNotebookMetaData = create<NotebookMetaDataType>()(
  persist(
    (set) => {
      return {
        hasPublished: new Subject(),
        sidebarTab: 'block',
        sidebarOpen: isE2E(),
        aiMode: false,

        toggleAIMode() {
          set(({ aiMode }) => ({ aiMode: !aiMode, sidebarOpen: false }));
        },

        toggleSidebar() {
          set(({ sidebarOpen }) => ({
            sidebarOpen: !sidebarOpen,
            aiMode: false,
          }));
        },

        setSidebarTab(sidebarTab: SelectedTab) {
          set(() => ({ sidebarTab }));
        },
      };
    },
    {
      name: 'notebook-ui-meta',
      partialize(state) {
        return Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['hasPublished', 'aiMode'].includes(key)
          )
        );
      },
      skipHydration: true,
    }
  )
);
