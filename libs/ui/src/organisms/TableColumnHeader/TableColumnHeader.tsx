import { ElementAttributes } from '@decipad/editor-types';
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
  Pick<
    ComponentProps<typeof TableHeader>,
    | 'type'
    | 'draggingOver'
    | 'dropDirection'
    | 'dragSource'
    | 'dropTarget'
    | 'dragPreview'
    | 'draggable'
    | 'onSelectColumn'
  > &
    Pick<
      ComponentProps<typeof TableColumnMenu>,
      'onChangeColumnType' | 'onRemoveColumn' | 'parseUnit' | 'isFirst'
    > & {
      as?: ElementType;
      empty?: boolean;
      focused?: boolean;
      readOnly?: boolean;
      attributes?: ElementAttributes;
    }
>;

export const TableColumnHeader: FC<TableColumnHeaderProps> = ({
  onChangeColumnType,
  onRemoveColumn,
  parseUnit,
  isFirst,
  type = getStringType(),
  readOnly = false,
  children,
  ...props
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <TableHeader
      {...props}
      isEditable={!readOnly}
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
            isFirst={isFirst}
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
