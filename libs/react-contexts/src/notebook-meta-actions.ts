import { persist } from 'zustand/middleware';
import { create } from 'zustand';
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

export type SidebarComponent = 'closed' | SidebarComponentsWithoutClosed;

export type SidebarComponentsWithoutClosed =
  | 'default-sidebar'
  | 'ai'
  | 'publishing';

export interface NotebookMetaDataType {
  readonly sidebarComponent: SidebarComponent;
  readonly toggleSidebar: (component: SidebarComponent) => void;

  readonly isSidebarOpen: () => boolean;

  readonly sidebarTab: SelectedTab;
  readonly setSidebarTab: (tab: SelectedTab) => void;

  // Should the user be able to alter their notebook?
  // Used for preventing errored notebooks from being editable.
  readonly canEdit: boolean;
  readonly setCanEdit: (state: boolean) => void;
}

export const useNotebookMetaData = create<NotebookMetaDataType>()(
  persist(
    (set, get) => {
      return {
        sidebarTab: 'block',

        sidebarComponent: isE2E() ? 'closed' : 'default-sidebar',

        isSidebarOpen() {
          const { sidebarComponent } = get();
          return sidebarComponent !== 'closed';
        },

        toggleSidebar(sidebarComponent) {
          const { sidebarComponent: currentComponent } = get();
          if (sidebarComponent === currentComponent) {
            set(() => ({ sidebarComponent: 'closed' }));
          } else {
            set(() => ({ sidebarComponent }));
          }
        },

        setSidebarTab(sidebarTab: SelectedTab) {
          set(() => ({ sidebarTab }));
        },

        canEdit: true,
        setCanEdit(canEdit) {
          if (!canEdit && get().sidebarComponent === 'ai') {
            get().toggleSidebar('ai');
          }
          set(() => ({ canEdit }));
        },
      };
    },
    {
      name: 'notebook-ui-meta',
      partialize(state) {
        return Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['hasPublished', 'canEdit', 'setCanEdit'].includes(key)
          )
        );
      },
    }
  )
);
