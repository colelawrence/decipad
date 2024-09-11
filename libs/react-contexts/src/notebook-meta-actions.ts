import { isE2E } from '@decipad/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SelectedTab = 'variable' | 'block';

export type SidebarComponent =
  | { type: 'closed' }
  | { type: 'navigation-sidebar' }
  | SidebarComponentsWithoutClosed;

export type SidebarComponentsWithoutClosed =
  | { type: 'default-sidebar' }
  | { type: 'ai' }
  | { type: 'publishing' }
  | { type: 'annotations' }
  | { type: 'integrations' }
  | { type: 'edit-integration' };

export type SidebarPublishingTab = 'collaborators' | 'publishing' | 'embed';

export interface NotebookMetaDataType {
  readonly sidebarComponent: SidebarComponent;
  readonly sidebarHistory: SidebarComponent[];
  readonly toggleSidebar: (component: SidebarComponent) => void;
  readonly setSidebar: (component: SidebarComponent) => void;
  readonly pushSidebar: (component: SidebarComponent) => void;
  readonly popSidebar: () => void;

  readonly isSidebarOpen: () => boolean;

  // Should the user be able to alter their notebook?
  // Used for preventing errored notebooks from being editable.
  readonly canEdit: boolean;
  readonly setCanEdit: (state: boolean) => void;

  readonly publishingTab: SidebarPublishingTab;
  readonly setPublishingTab: (tab: SidebarPublishingTab) => void;

  readonly workspacePlan: string;
  readonly setWorkspacePlan: (workspacePlan: string) => void;

  readonly integrationBlockId: string | undefined;
  readonly setIntegrationBlockId: (blockId: string) => void;
}

export const useNotebookMetaData = create<NotebookMetaDataType>()(
  persist(
    (set, get) => {
      return {
        sidebarTab: 'block',
        // hahahahha, try remove the `as undefined`.
        integrationBlockId: undefined as undefined,
        setIntegrationBlockId(blockId) {
          set({ integrationBlockId: blockId });
        },

        sidebarComponent: { type: isE2E() ? 'closed' : 'default-sidebar' },
        sidebarHistory: [],

        isSidebarOpen() {
          const { sidebarComponent } = get();
          return sidebarComponent.type !== 'closed';
        },

        toggleSidebar(sidebarComponent) {
          const { sidebarComponent: currentComponent } = get();
          if (sidebarComponent.type === currentComponent.type) {
            set(() => ({ sidebarComponent: { type: 'closed' } }));
          } else {
            set(() => ({ sidebarComponent }));
          }
        },

        setSidebar(sidebarComponent) {
          set(() => ({ sidebarComponent }));
        },

        pushSidebar(sidebarComponent) {
          set(() => {
            const { sidebarHistory, sidebarComponent: prevSidebar } = get();
            sidebarHistory.push(prevSidebar);
            return {
              sidebarHistory,
              sidebarComponent,
            };
          });
        },

        popSidebar() {
          set(() => {
            const { sidebarHistory } = get();
            const sidebarComponent = sidebarHistory.pop() ?? { type: 'closed' };
            return {
              sidebarHistory,
              sidebarComponent,
            };
          });
        },

        canEdit: true,
        setCanEdit(canEdit) {
          if (!canEdit && get().sidebarComponent.type === 'ai') {
            get().toggleSidebar({ type: 'ai' });
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
