import { ComponentProps, FC, useState } from 'react';
import { CellInput, TableHeader } from '../../atoms';

import { TableColumnMenu } from '..';

const alwaysValid = () => true;

type EditableTableHeaderProps = ComponentProps<typeof TableHeader> &
  ComponentProps<typeof TableColumnMenu> &
  Omit<ComponentProps<typeof CellInput>, 'validate'>;

export const EditableTableHeader: FC<EditableTableHeaderProps> = ({
  onChangeColumnType,
  onChange,
  onRemoveColumn,
  type,
  value,
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <TableHeader
      highlight={isMenuOpen}
      rightSlot={
        <TableColumnMenu
          onChangeColumnType={onChangeColumnType}
          onRemoveColumn={onRemoveColumn}
          onOpenChange={setMenuOpen}
        />
      }
      type={type}
    >
      <CellInput
        onChange={onChange}
        placeholder="Column name"
        validate={alwaysValid}
        value={value}
        variant="header"
      />
    </TableHeader>
  );
};
