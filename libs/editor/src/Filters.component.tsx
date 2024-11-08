import { useNotebookWithIdState } from '@decipad/notebook-state';
import { css } from '@emotion/react';
import { cssVar, p13Medium } from '@decipad/ui';
import { Add, Close } from 'libs/ui/src/icons';
import { useFilters } from '@decipad/editor-hooks';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { useNotebookRoute } from '@decipad/routing';
import { useGetNotebookMetaQuery } from '@decipad/graphql-client';

const filtersContainer = css({
  maxWidth: '620px',
  margin: '0 auto',
  paddingTop: '26px',
  paddingBottom: '26px',
});

const filterWrapper = css(p13Medium, {
  display: 'inline-flex',
  gap: '1px',
  marginRight: '10px',
  color: cssVar('textDefault'),
});

const borderRadius = 5;

const filterChild = css({
  background: cssVar('backgroundDefault'),
  padding: '6px 8px',
});
const filterName = css(filterChild, {
  borderBottomLeftRadius: borderRadius,
  borderTopLeftRadius: borderRadius,
});
const filterValue = css(filterChild, {});

const filterDelete = css(filterChild, {
  borderTopRightRadius: borderRadius,
  borderBottomRightRadius: borderRadius,
  padding: '4px',
  width: '24px',
  cursor: 'pointer',
  '&:hover': {
    background: cssVar('backgroundHeavy'),
  },
  '&:focus': {
    outline: `2px solid ${cssVar('backgroundHeavy')}`,
    outlineOffset: '-2px',
  },
});

const addFilterStyles = css(p13Medium, {
  display: 'flex',
  alignItems: 'center',
  background: cssVar('backgroundDefault'),
  gap: 2,
  borderRadius,
  padding: '4px 8px 4px 4px',
  svg: {
    width: 16,
  },
  '&:hover': {
    background: cssVar('backgroundHeavy'),
  },
});

export const Filters = () => {
  const controller = useNotebookWithIdState((s) => s.controller!);
  // eslint-disable-next-line no-shadow
  const { addFilter } = useNotebookMetaData(({ addFilter }) => {
    return { addFilter };
  });
  const { filters, deleteFilter, hasIntegrations } = useFilters(controller);
  const { notebookId } = useNotebookRoute();
  const [{ data: notebookMetaData }] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });
  const isReadOnly = !(
    notebookMetaData?.getPadById?.myPermissionType === 'WRITE' ||
    notebookMetaData?.getPadById?.myPermissionType === 'ADMIN'
  );

  if (!isFlagEnabled('INTEGRATION_FILTERS')) return null;
  if (isReadOnly) return null;
  if (!hasIntegrations) return null;

  return (
    <div css={filtersContainer}>
      {filters?.length === 0 && !isReadOnly && (
        <button css={addFilterStyles} onClick={addFilter}>
          <Add />
          <span>Add filter</span>
        </button>
      )}
      {filters?.map((filter) => {
        return (
          <div
            key={`${filter.filterName}-${filter.columnId}`}
            css={filterWrapper}
          >
            <span css={filterName}>{filter.filterName}</span>
            <span css={filterValue}>{filter.value}</span>
            {!isReadOnly && (
              <button css={filterDelete} onClick={() => deleteFilter(filter)}>
                <Close />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
