import type { Session } from 'next-auth';
import type { Computer } from '@decipad/computer-interfaces';
import type { DocSyncEditor, DocSyncOptions } from '@decipad/docsync';
import type {
  BlockProcessor,
  EditorController,
  Reporter,
} from '@decipad/notebook-tabs';
import type { MyPlatePlugin } from '@decipad/editor-types';
import { Subject, Subscription } from 'rxjs';
import {
  GetNotebookAnnotationsQuery,
  PermissionType,
} from '@decipad/graphql-client';
import { UserInteraction } from '@decipad/react-contexts';
import { TOperation } from '@udecode/plate-common';

interface InitNotebookStateOptions {
  docsync: Omit<DocSyncOptions, 'editor' | 'controller'>;
  plugins: MyPlatePlugin[];
  onChangeTitle: (title: string) => void;
}

export type EnhancedPromise<T> = typeof Promise & {
  resolved?: T;
};

export type DataDrawerState = {
  // TODO: Tie these types to the data-drawer/data-drawer.tsx switch statements instead of duplicating.
  dataDrawerMode:
    | {
        type: 'edit';
        variableId: string;
      }
    | {
        type: 'create';
      }
    | {
        type: 'integration-preview';
      }
    | {
        type: 'workspace-number';
        workspaceNumberId: string;
      }
    | {
        type: 'closed';
      };

  // Specific boolean so we can know that the data drawer has been fully rendered to the DOM.
  isDataDrawerOpen: boolean;

  setIsDataDrawerOpen: (isOpen: boolean) => void;
  setAddVariable: () => void;
  setEditingVariable: (id: string) => void;
  closeDataDrawer: () => void;
  setIntegration: () => void;
  setWorkspaceNumber: (workspaceNumberId: string) => void;

  // cosmetics
  height: number;
  setHeight: (h: number) => void;
  isClosing: boolean;
};

export type AnnotationsState = {
  annotations: NonNullable<
    GetNotebookAnnotationsQuery['getAnnotationsByPadId']
  >;
  setAnnotations: (
    annotations: NonNullable<
      GetNotebookAnnotationsQuery['getAnnotationsByPadId']
    >
  ) => void;

  expandedBlockId: string | undefined;

  handleExpandedBlockId: (id: string | undefined) => void;

  permission: PermissionType | undefined;
  setPermission: (permissionType: PermissionType | undefined) => void;
};

export type EditorState = {
  notebookLoadedPromise: EnhancedPromise<DocSyncEditor>;
  resolveNotebookLoadedPromise: () => (e: DocSyncEditor) => void;
  blockProcessor: BlockProcessor | undefined;
  notebookId?: string | undefined;
  syncClientState: 'idle' | 'created';

  controller: EditorController | undefined;
  editor?: DocSyncEditor | undefined;
  computer: Computer | undefined;
  initEditor: (props: {
    notebookId: string;
    options: InitNotebookStateOptions;
    getSession: () => Session | undefined;
    interactions: Subject<UserInteraction>;
  }) => void;
  destroy: () => void;
  loadedFromLocal: boolean;
  loadedFromRemote: boolean;
  timedOutLoadingFromRemote: boolean;
  hasLocalChanges: boolean;
  notebookHref?: string;
  hasNotSavedRemotelyInAWhile: boolean;
  setInitialFocusDone: () => void;
  initialFocusDone: boolean;
  destroyed?: boolean;
  isNewNotebook: boolean;

  editorChanges: Subject<undefined>;
  reporter: Reporter<TOperation> | undefined;

  interactionsSubscription: Subscription | undefined;
};

export type NotebookState = EditorState & DataDrawerState & AnnotationsState;
