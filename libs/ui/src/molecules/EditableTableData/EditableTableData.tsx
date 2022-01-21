import { css } from '@emotion/react';
import { FC, ComponentProps } from 'react';
import { CellInput, TableData } from '../../atoms';
import { table } from '../../styles';

const cellWrapperStyles = css({
  padding: `0 ${table.cellSidePadding}`,
});

type EditableTableDataProps = Pick<
  ComponentProps<typeof CellInput>,
  'onChange' | 'readOnly' | 'validate' | 'value'
>;

export const EditableTableData = ({
  onChange,
  readOnly,
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
          readOnly={readOnly}
        />
      </div>
    </TableData>
  );
};
