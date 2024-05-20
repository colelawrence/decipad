import { isE2E } from '@decipad/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SelectedTab = 'variable' | 'block';

export type SidebarComponent = 'closed' | SidebarComponentsWithoutClosed;

export type SidebarComponentsWithoutClosed =
  | 'default-sidebar'
  | 'ai'
  | 'publishing'
  | 'annotations';

export type SidebarPublishingTab = 'collaborators' | 'publishing' | 'embed';

export interface NotebookMetaDataType {
  readonly sidebarComponent: SidebarComponent;
  readonly toggleSidebar: (component: SidebarComponent) => void;
  readonly setSidebar: (component: SidebarComponent) => void;

  readonly isSidebarOpen: () => boolean;

  // Should the user be able to alter their notebook?
  // Used for preventing errored notebooks from being editable.
  readonly canEdit: boolean;
  readonly setCanEdit: (state: boolean) => void;

  readonly publishingTab: SidebarPublishingTab;
  readonly setPublishingTab: (tab: SidebarPublishingTab) => void;

  readonly workspacePlan: string;
  readonly setWorkspacePlan: (workspacePlan: string) => void;
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

        setSidebar(sidebarComponent) {
          set(() => ({ sidebarComponent }));
        },

        canEdit: true,
        setCanEdit(canEdit) {
          if (!canEdit && get().sidebarComponent === 'ai') {
            get().toggleSidebar('ai');
          }
          set(() => ({ canEdit }));
        },

        publishingTab: 'collaborators',
        setPublishingTab(publishingTab) {
          set(() => ({ publishingTab }));
        },

        workspacePlan: 'free',
        setWorkspacePlan(workspacePlan) {
          set(() => ({ workspacePlan }));
        },
      };
    },
    {
      name: 'notebook-ui-meta',
      partialize(state) {
        return Object.fromEntries(
          Object.entries(state).filter(
            ([key]) =>
              ![
                'hasPublished',
                'canEdit',
                'setCanEdit',
                'isNewNotebook',
              ].includes(key)
          )
        );
      },
    }
  )
);
