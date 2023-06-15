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
import { getStringType } from '../../utils';

const rightSlotStyles = css({
  // opacity is being set to 1 on hover by the parent
  opacity: 0,
  display: 'grid',
  alignItems: 'center',
  width: '16px',
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
    | 'onRemoveColumn'
    | 'onAddColRight'
    | 'onAddColLeft'
  > &
    Pick<
      ComponentProps<typeof TableColumnMenu>,
      'onChangeColumnType' | 'parseUnit' | 'isFirst' | 'dropdownNames'
    > & {
      as?: ElementType;
      empty?: boolean;
      focused?: boolean;
      readOnly?: boolean;
      isForImportedColumn?: boolean;
      attributes?: ElementAttributes;
      error?: string;
    }
>;

export const TableColumnHeader: FC<TableColumnHeaderProps> = ({
  onChangeColumnType,
  onRemoveColumn,
  onAddColLeft,
  onAddColRight,
  parseUnit,
  isFirst,
  type = getStringType(),
  readOnly = false,
  isForImportedColumn = false,
  children,
  dropdownNames = [],
  error,
  ...props
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <TableHeader
      {...props}
      onRemoveColumn={onRemoveColumn}
      onAddColLeft={onAddColLeft}
      onAddColRight={onAddColRight}
      isEditable={!readOnly}
      isFirst={isFirst}
      menu={
        !readOnly && (
          <TableColumnMenu
            trigger={
              <button
                data-testid="table-column-menu-button"
                className="table-caret"
                css={rightSlotStyles}
              >
                <Caret variant="down" />
              </button>
            }
            open={isMenuOpen}
            onChangeOpen={setMenuOpen}
            onChangeColumnType={onChangeColumnType}
            parseUnit={parseUnit}
            isFirst={isFirst}
            type={type}
            isForImportedColumn={isForImportedColumn}
            dropdownNames={dropdownNames}
          />
        )
      }
      highlight={isMenuOpen}
      type={type}
      error={error}
    >
      {children}
    </TableHeader>
  );
};
