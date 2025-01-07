import { assert, changePageSize } from '@decipad/utils';
import { MenuList, PaginationControl } from '../../molecules';
import { MenuItem } from '../../atoms';
import styled from '@emotion/styled';
import { p13Medium } from 'libs/ui/src/primitives';

type PaginationSizeControlProps = {
  currentPage: number;
  onPageChange: (page: number) => void;

  pageSize: number;
  onChangePageSize: (pageSize: number) => void;

  rowCount: number;
};

export const PaginationSizeControl = ({
  currentPage,
  onPageChange,
  pageSize,
  onChangePageSize,
  rowCount,
}: PaginationSizeControlProps) => {
  assert(pageSize > 0 && rowCount >= 0 && currentPage > 0, 'Invalid props');

  const onAdjustPageSize = (newPageSize: number) => {
    onChangePageSize(newPageSize);
    onPageChange(
      changePageSize({ currentPage, newPageSize, currentPageSize: pageSize })
    );
  };

  return (
    <PaginationControlWrapper>
      <PaginationControl
        startAt={1}
        maxPages={Math.ceil(rowCount / pageSize)}
        page={currentPage}
        onPageChange={onPageChange}
      />
      <NoWrapSpan>
        {rowCount} rows, previewing rows {(currentPage - 1) * pageSize + 1} to{' '}
        {Math.min(currentPage * pageSize, rowCount)}
      </NoWrapSpan>
      <MenuList
        root
        dropdown
        caret
        trigger={<Trigger>Rows: {pageSize}</Trigger>}
      >
        <MenuItem onSelect={() => onAdjustPageSize(10)}>10</MenuItem>
        <MenuItem onSelect={() => onAdjustPageSize(25)}>25</MenuItem>
        <MenuItem onSelect={() => onAdjustPageSize(50)}>50</MenuItem>
        <MenuItem onSelect={() => onAdjustPageSize(100)}>100</MenuItem>
      </MenuList>
    </PaginationControlWrapper>
  );
};

const PaginationControlWrapper = styled.div({
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
});

const Trigger = styled.div(p13Medium, {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '8px',
});

const NoWrapSpan = styled.span({
  whiteSpace: 'nowrap',
});
