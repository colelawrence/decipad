import { EditableFilter, useFilters } from '@decipad/editor-hooks';
import { Button, cssVar, MenuItem, MenuList, p13Medium } from '@decipad/ui';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { css } from '@emotion/react';
import {
  Add,
  Duplicate,
  Edit,
  Ellipsis,
  Trash,
  Filter as FilterIcon,
} from 'libs/ui/src/icons';
import { DraftFilterForm, DraftFilter } from './DraftFilter';
import { ErrorBoundary } from '@sentry/react';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { useNotebookRoute } from '@decipad/routing';
import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { format } from 'date-fns';

const containerStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const titleStyles = css([
  p13Medium,
  {
    color: cssVar('textSubdued'),
  },
]);

export const buttonContainerStyles = css({
  display: 'flex',
  justifyContent: 'flex-start',
  gap: '8px',
  '> button': {
    flex: '0 0 auto',
  },
});

const addButtonContainerStyles = css(buttonContainerStyles, {
  button: {
    paddingLeft: 0,
    padding: '4px 0',
    gap: '4px',
  },
  svg: {
    height: 16,
  },
});

const filterListStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

const filterListItemStyles = css({
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
});

const filterMenuHandleStyles = (menuOpen: boolean) =>
  css(
    {
      width: 32,
      height: 32,
      padding: 8,
      borderRadius: 8,
      marginBottom: 8,
      '&:hover': {
        background: cssVar('backgroundHeavy'),
        border: `1px solid ${cssVar('backgroundHeavier')}`,
      },
    },
    menuOpen
      ? {
          background: cssVar('backgroundHeavy'),
          border: `1px solid ${cssVar('backgroundHeavier')}`,
        }
      : {}
  );

const filterIconStyles = css({
  height: 16,
});

const filterNameStyles = css(p13Medium, {
  fontWeight: 400,
  flex: '1',
});

const editableFilterToDraftFilter = (filter: EditableFilter): DraftFilter => {
  switch (filter.type) {
    case 'string':
      return {
        filterName: filter.filterName,
        columnId: filter.columnId,
        type: 'string',
        value: filter.value,
      };
    case 'number':
      return {
        filterName: filter.filterName,
        columnId: filter.columnId,
        type: 'number',
        value: filter.value.toString(),
      };
    case 'date':
      return {
        filterName: filter.filterName,
        columnId: filter.columnId,
        type: 'date',
        value: format(new Date(filter.value.time), 'yyyy-MM-dd'),
      };
  }
};

const FilterListItem = ({
  filter,
  deleteFilter,
  draftFilter,
  setDraftFilter,
}: {
  filter: EditableFilter;
  deleteFilter: (filter: EditableFilter) => void;
  draftFilter?: DraftFilter;
  setDraftFilter: Dispatch<SetStateAction<DraftFilter | undefined>>;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = (
    <button
      css={css(filterMenuHandleStyles(menuOpen))}
      onClick={() => setMenuOpen((x) => !x)}
      aria-label="Filter options"
      type="button"
    >
      <Ellipsis />
    </button>
  );

  const isBeingEdited = draftFilter?.id === filter.id;
  const handleEdit = useCallback(() => {
    setDraftFilter(editableFilterToDraftFilter(filter));
  }, [filter, setDraftFilter]);

  const handleDuplicate = useCallback(() => {
    setDraftFilter(editableFilterToDraftFilter(filter));
  }, [filter, setDraftFilter]);

  return isBeingEdited ? (
    <DraftFilterForm
      filter={draftFilter}
      setDraftFilter={setDraftFilter as Dispatch<SetStateAction<DraftFilter>>}
      closeForm={() => setDraftFilter(undefined)}
    />
  ) : (
    <div css={filterListItemStyles}>
      <FilterIcon css={filterIconStyles} />
      <div css={filterNameStyles}>
        <span>{filter.filterName}</span>
      </div>
      {
        <MenuList
          root
          open={menuOpen}
          onChangeOpen={setMenuOpen}
          trigger={menuButton}
          dropdown
          side="bottom"
          align="end"
          styles={css({ marginTop: 4 })}
        >
          <MenuItem icon={<Edit />} onClick={handleEdit}>
            Edit
          </MenuItem>
          <MenuItem icon={<Duplicate />} onClick={handleDuplicate}>
            Duplicate
          </MenuItem>
          <MenuItem icon={<Trash />} onClick={() => deleteFilter(filter)}>
            Delete
          </MenuItem>
        </MenuList>
      }
    </div>
  );
};

const FilterList = ({
  filters,
  deleteFilter,
  draftFilter,
  setDraftFilter,
}: {
  filters: EditableFilter[];
  deleteFilter: (filter: EditableFilter) => void;
  draftFilter?: DraftFilter;
  setDraftFilter: Dispatch<SetStateAction<DraftFilter | undefined>>;
}) => {
  return (
    <div css={filterListStyles}>
      {filters.map((filter) => {
        return (
          <FilterListItem
            key={filter.id}
            filter={filter}
            deleteFilter={deleteFilter}
            draftFilter={draftFilter}
            setDraftFilter={setDraftFilter}
          />
        );
      })}
    </div>
  );
};

export const Filters = () => {
  const controller = useNotebookWithIdState((s) => s.controller!);
  // TODO remove empty filter
  const [draftFilter, setDraftFilter] = useState<DraftFilter>();
  const { filters, deleteFilter, hasIntegrations } = useFilters(controller);
  const { notebookId } = useNotebookRoute();
  const [{ data: notebookMetaData }] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });
  const isReadOnly = !(
    notebookMetaData?.getPadById?.myPermissionType === 'WRITE' ||
    notebookMetaData?.getPadById?.myPermissionType === 'ADMIN'
  );

  const { addFilterSymbol, resetAddFilterSymbol } = useNotebookMetaData((s) => {
    return {
      addFilterSymbol: s.addFilterSymbol,
      resetAddFilterSymbol: s.resetAddFilterSymbol,
    };
  });

  const lastAddFilterSymbol = useRef<Symbol>();
  useEffect(() => {
    if (lastAddFilterSymbol.current !== addFilterSymbol) {
      lastAddFilterSymbol.current = addFilterSymbol;
      setDraftFilter({});
    }

    return () => {
      resetAddFilterSymbol();
    };
  }, [addFilterSymbol, lastAddFilterSymbol, resetAddFilterSymbol]);

  if (!isFlagEnabled('INTEGRATION_FILTERS')) return null;
  if (isReadOnly) return null;

  if (!hasIntegrations) return null;

  // TODO give filter a name
  return (
    <ErrorBoundary fallback={<div>Failed to load filters</div>}>
      <div css={containerStyles}>
        <div css={titleStyles}>Filters</div>
        {filters.length > 0 && (
          <FilterList
            filters={filters}
            deleteFilter={deleteFilter}
            draftFilter={draftFilter}
            setDraftFilter={setDraftFilter}
          />
        )}
        {draftFilter && draftFilter.id === undefined ? (
          <DraftFilterForm
            filter={draftFilter}
            setDraftFilter={
              setDraftFilter as Dispatch<SetStateAction<DraftFilter>>
            }
            closeForm={() => setDraftFilter(undefined)}
          />
        ) : (
          <div css={addButtonContainerStyles}>
            <Button
              type="text"
              onClick={() => setDraftFilter({})}
              testId="add-filter"
            >
              <Add /> Add Filter
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
