import {
  ComponentProps,
  ElementType,
  FC,
  PropsWithChildren,
  useState,
} from 'react';
import { css } from '@emotion/react';
import { PlateComponentAttributes } from '@decipad/editor-types';
import { TableHeader } from '../../atoms';
import { getStringType } from '../../utils';

import { TableColumnMenu } from '..';
import { Caret } from '../../icons';
import { table } from '../../styles';

const rightSlotStyles = css({
  display: 'grid',
  alignItems: 'center',
  width: '16px',
  minHeight: table.thMinHeight,
});

type TableColumnHeaderProps = PropsWithChildren<
  Pick<ComponentProps<typeof TableHeader>, 'type'> &
    Pick<
      ComponentProps<typeof TableColumnMenu>,
      'onChangeColumnType' | 'onRemoveColumn' | 'parseUnit'
    > & {
      as?: ElementType;
      empty?: boolean;
      focused?: boolean;
      readOnly?: boolean;
      attributes?: PlateComponentAttributes;
    }
>;

export const TableColumnHeader: FC<TableColumnHeaderProps> = ({
  onChangeColumnType,
  onRemoveColumn,
  parseUnit,
  type = getStringType(),
  readOnly = false,
  children,
  ...props
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <TableHeader
      {...props}
      menu={
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
      {children}
    </TableHeader>
  );
};
