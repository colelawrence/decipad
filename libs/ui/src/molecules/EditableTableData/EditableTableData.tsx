import { FC, ComponentProps } from 'react';
import { CellInput, TableData } from '../../atoms';

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
      <CellInput
        onChange={onChange}
        validate={validate}
        value={value}
        variant="data"
      />
    </TableData>
  );
};
