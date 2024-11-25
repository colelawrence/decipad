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
  readonly toggleAddNewVariable: () => void;
  readonly search: string;
  readonly setSearch: Dispatch<SetStateAction<string>>;
}>;

export type NotebookNavigationProps = Readonly<{
  readonly workspaceId?: string;
  readonly currentNotebookId: string;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly actions: NotebookMetaActionsReturn;
  readonly notebook: Notebook;
  readonly href: string;
  readonly sections?: Section[];
}>;

export type SectionContentProps = Readonly<{
  readonly section: Section;
  readonly notebooks: Notebook[];
  readonly selectedSection?: string;
  readonly setSelectedSection: (_: string | undefined) => void;
  readonly workspaceId?: string;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly actions: NotebookMetaActionsReturn;
  readonly notebookId: string;
  readonly sections: Section[];
}>;

export type NumberCatalogPaneProps = Readonly<{
  readonly numberCatalog: ReactNode;
  readonly toggleAddNewVariable: () => void;
}>;

export type NotebookNavigationPaneProps = Readonly<{
  readonly sections: Section[];
  readonly workspaceId?: string;
  readonly notebooks?: Notebook[] | null;
  readonly notebookId: string;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly actions: NotebookMetaActionsReturn;
}>;
