import { ComponentProps, FC, useState } from 'react';
import { css } from '@emotion/react';
import { CellInput, TableHeader } from '../../atoms';
import { getStringType } from '../../utils';

import { TableColumnMenu } from '..';
import { identifierNamePattern } from '../../utils/language';
import { Caret } from '../../icons';

const rightSlotStyles = css({
  display: 'grid',
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
    'onChangeColumnType' | 'onRemoveColumn' | 'parseUnit'
  > &
  Pick<ComponentProps<typeof CellInput>, 'onChange' | 'readOnly' | 'value'>;

export const EditableTableHeader: FC<EditableTableHeaderProps> = ({
  onChangeColumnType,
  onChange,
  onRemoveColumn,
  parseUnit,
  type = getStringType(),
  readOnly = false,
  value,
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <TableHeader
      rightSlot={
        !readOnly && (
          <TableColumnMenu
            trigger={
              <button css={rightSlotStyles}>
                <Caret variant="down" />
              </button>
            }
            open={isMenuOpen}
            onChangeOpen={setMenuOpen}
            onChangeColumnType={onChangeColumnType}
            onRemoveColumn={onRemoveColumn}
            parseUnit={parseUnit}
            type={type}
          />
        )
      }
      highlight={isMenuOpen}
      type={type}
    >
      <CellInput
        onChange={onChange}
        placeholder="ColumnName"
        readOnly={readOnly}
        transform={(newValue) =>
          newValue.match(identifierNamePattern)?.join('') ?? ''
        }
        value={value}
        variant="header"
      />
    </TableHeader>
  );
};
