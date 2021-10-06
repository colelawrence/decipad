import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
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
  attributes,
  children,
  nodeProps,
  onAddRow,
}: ComponentProps<PlatePluginComponent> &
  ComponentProps<typeof AddRowButton>): ReturnType<FC> => {
  return (
    <div>
      <table
        spellCheck={false}
        css={tableStyles}
        {...attributes}
        {...nodeProps}
      >
        {children}
      </table>

      <AddRowButton onAddRow={onAddRow} />
    </div>
  );
};
