import { EditorSidebarTab } from '@decipad/editor-types';
import { PlateEditorWithSelectionHelpers } from '@decipad/interfaces';
import { isE2E } from '@decipad/utils';
import { TEditor } from '@udecode/plate-common';
import { BaseRange } from 'slate';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SidebarComponent =
  | { type: 'closed' }
  | { type: 'navigation-sidebar' }
  | SidebarComponentsWithoutClosed;

type FormulaHelperType = {
  type: 'formula-helper';
  editor?: PlateEditorWithSelectionHelpers<TEditor> | undefined;
  selection?: Partial<BaseRange> | undefined;
};

export type SidebarComponentsWithoutClosed =
  | { type: 'default-sidebar'; selectedTab?: EditorSidebarTab }
  | { type: 'ai' }
  | { type: 'publishing' }
  | { type: 'annotations' }
  | { type: 'integrations' }
  | { type: 'edit-integration' }
  | FormulaHelperType;

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
      version: 3,
      migrate: (state, version) => {
        if (version < 3) {
          const oldState = state as NotebookMetaDataType & {
            sidebarComponent: unknown;
          };
          const extractComponentType = (obj: unknown): string | null => {
            if (typeof obj === 'string') return obj;
            if (typeof obj === 'object' && !!obj && 'type' in obj)
              return extractComponentType(obj.type);
            return null;
          };
          return {
            ...(state as NotebookMetaDataType),
            sidebarComponent: {
              type: (extractComponentType(oldState.sidebarComponent) ??
                'closed') as SidebarComponent['type'],
            },
            sidebarHistory: [],
          };
        }
        return state as NotebookMetaDataType;
      },
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
