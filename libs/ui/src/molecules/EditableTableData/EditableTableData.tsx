import { css } from '@emotion/react';
import { FC, ComponentProps } from 'react';
import { CellInput, TableData } from '../../atoms';
import { table } from '../../styles';

const cellWrapperStyles = css({
  padding: `0 ${table.cellSidePadding}`,
});

type EditableTableDataProps = Omit<
  ComponentProps<typeof TableData>,
  'children'
> &
  Omit<ComponentProps<typeof CellInput>, 'className'>;

export const EditableTableData = ({
  onChange,
  validate,
  value,
}: EditableTableDataProps): ReturnType<FC> => {
  return (
    <TableData>
      <div css={cellWrapperStyles}>
        <CellInput
          onChange={onChange}
          validate={validate}
          value={value}
          variant="data"
        />
      </div>
    </TableData>
  );
};
