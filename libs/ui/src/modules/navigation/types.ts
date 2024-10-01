import { WorkspaceSwitcherWorkspaceFragment } from '@decipad/graphql-client';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { Section, Notebook } from '../../types';

export type NavigationSidebarProps = Readonly<{
  readonly sections: Section[];
  readonly numberCatalog: ReactNode;
  readonly notebooks?: Notebook[] | null;
  readonly workspaceId?: string;
  readonly notebookId: string;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly actions: NotebookMetaActionsReturn;
  readonly onDuplicate: (_: string) => void;
  readonly toggleAddNewVariable: () => void;
  readonly search: string;
  readonly setSearch: Dispatch<SetStateAction<string>>;
}>;
