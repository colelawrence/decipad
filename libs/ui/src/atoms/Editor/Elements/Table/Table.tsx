import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { AddRowButton } from './AddRowButton';

const tableStyles = css({
  width: '100%',
  borderCollapse: 'collapse',
  borderRadius: '6px',
  fontFamily: 'monospace',
  tableLayout: 'fixed',
});

export const TableElement = ({
  onAddRow,
  ...props
}: ComponentProps<'table'> &
  ComponentProps<typeof AddRowButton>): ReturnType<FC> => {
  return (
    <div>
      <table css={tableStyles} {...props} />
      <AddRowButton onAddRow={onAddRow} />
    </div>
  );
};
