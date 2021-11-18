import { ComponentProps, FC, useState } from 'react';
import { css } from '@emotion/react';
import { CellInput, TableHeader } from '../../atoms';
import { typeIcons } from '../../atoms/TableHeader/TableHeader';

import { TableColumnMenu } from '..';

const alwaysValid = () => true;

const triggerStyles = css({
  cursor: 'pointer',
  display: 'flex',

  padding: '6px 0',

  '& > svg': {
    height: '16px',
    width: '16px',
  },
});

type EditableTableHeaderProps = Pick<
  ComponentProps<typeof TableHeader>,
  'type'
> &
  Pick<
    ComponentProps<typeof TableColumnMenu>,
    'onChangeColumnType' | 'onRemoveColumn'
  > &
  Pick<ComponentProps<typeof CellInput>, 'onChange' | 'value'>;

export const EditableTableHeader: FC<EditableTableHeaderProps> = ({
  onChangeColumnType,
  onChange,
  onRemoveColumn,
  type = 'string',
  value,
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const Icon = typeIcons[type];

  return (
    <TableHeader
      icon={
        <TableColumnMenu
          trigger={
            <button css={triggerStyles}>
              <Icon />
            </button>
          }
          onChangeColumnType={onChangeColumnType}
          onRemoveColumn={onRemoveColumn}
          onOpenChange={setMenuOpen}
        />
      }
      highlight={isMenuOpen}
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
