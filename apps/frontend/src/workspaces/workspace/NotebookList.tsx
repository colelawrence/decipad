import { ComponentProps, FC } from 'react';
import {
  WorkspaceNotebookFragment,
  WorkspaceSwitcherWorkspaceFragment,
} from '@decipad/graphql-client';
import {
  NotebookListItem,
  UINotebookList,
  useSearchBarStore,
} from '@decipad/ui';
import { PageTypes, useFilteredNotebooks, useSearchResults } from './hooks';
import { parseIconColorFromIdentifier } from '../../utils';
import { useNotebookMetaActions } from '../../hooks';

type NotebookListProps = Pick<
  ComponentProps<typeof UINotebookList>,
  'onImport'
> & {
  readonly pageType: PageTypes;
  readonly notebooks: Array<WorkspaceNotebookFragment>;
  readonly sharedNotebooks: Array<WorkspaceNotebookFragment>;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
};

type ListItemType = ComponentProps<typeof NotebookListItem>;

/**
 * Responsible for handling display and actions of notebooks.
 * It handles filtering, search, etc...
 */
export const NotebookList: FC<NotebookListProps> = ({
  notebooks,
  sharedNotebooks,
  pageType,
  workspaces,
  onImport,
}) => {
  const actions = useNotebookMetaActions(pageType === 'archived');
  const { search, status, visibility } = useSearchBarStore();
  const filteredNotebooks = useFilteredNotebooks(
    pageType,
    notebooks,
    sharedNotebooks
  );

  const searchedNotebooks = useSearchResults(
    filteredNotebooks,
    search,
    status,
    visibility
  );

  const [isSearchEmpty, notebookList] = getEmptyAndNotebooks(
    searchedNotebooks,
    filteredNotebooks,
    search,
    status,
    visibility
  );

  return (
    <UINotebookList onImport={onImport} isSearchEmpty={isSearchEmpty}>
      {notebookList.map((n) => {
        const { icon, iconColor } = parseIconColorFromIdentifier(n?.icon);
        return (
          <li key={n.id}>
            <NotebookListItem
              id={n.id}
              isArchived={pageType === 'archived'}
              status={(n.status as ListItemType['status']) ?? 'draft'}
              isPublic={Boolean(n.isPublic)}
              creationDate={n.createdAt && new Date(n.createdAt)}
              name={n.name}
              icon={icon}
              iconColor={iconColor}
              workspaces={workspaces}
              onChangeStatus={actions.onChangeStatus}
              onDelete={actions.onDeleteNotebook}
              onExport={actions.onDownloadNotebook}
              onExportBackups={actions.onDownloadNotebookHistory}
              onMoveToSection={actions.onMoveToSection}
              onMoveWorkspace={actions.onMoveToWorkspace}
              onUnarchive={actions.onUnarchiveNotebook}
              onDuplicate={actions.onDuplicateNotebook}
              notebookId={n.id}
            />
          </li>
        );
      })}
    </UINotebookList>
  );
};

/**
 * Very specific helper function to reduce amount of code in component body.
 * Returns if search bar is empty, and also which notebooks we should show.
 */
function getEmptyAndNotebooks(
  searchedNotebooks: Array<WorkspaceNotebookFragment>,
  filteredNotebooks: Array<WorkspaceNotebookFragment>,
  search: string,
  status: string[],
  visibility: string
): [boolean, Array<WorkspaceNotebookFragment>] {
  // Search bar completely empty.
  const nothingToSearch =
    search.trim().length === 0 &&
    status.length === 0 &&
    visibility.trim().length === 0;

  // If we have something to search, and we get 0.
  const isSearchEmpty = !nothingToSearch && searchedNotebooks.length === 0;

  // If our search is empty, ot we found no results.
  const notebooks =
    nothingToSearch || searchedNotebooks.length === 0
      ? filteredNotebooks
      : searchedNotebooks;

  return [isSearchEmpty, notebooks];
}
