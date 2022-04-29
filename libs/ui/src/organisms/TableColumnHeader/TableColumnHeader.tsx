import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import {
  ComponentProps,
  ElementType,
  FC,
  PropsWithChildren,
  useState,
} from 'react';
import { TableColumnMenu } from '..';
import { TableHeader } from '../../atoms';
import { Caret } from '../../icons';
import { table } from '../../styles';
import { getStringType } from '../../utils';

const rightSlotStyles = css({
  display: 'grid',
  alignItems: 'center',
  width: '16px',
  minHeight: table.thMinHeight,
});

type TableColumnHeaderProps = PropsWithChildren<
  Pick<ComponentProps<typeof TableHeader>, 'type' | 'color'> &
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
  color,
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
      color={color}
    >
      {children}
    </TableHeader>
  );
};
