import { ElementAttributes } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
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
  opacity: 1,
  display: 'grid',
  alignItems: 'center',
  width: '16px',
});

type TableColumnHeaderProps = PropsWithChildren<
  Pick<
    ComponentProps<typeof TableHeader>,
    | 'type'
    | 'setWidth'
    | 'width'
    | 'draggingOver'
    | 'dropDirection'
    | 'dragSource'
    | 'dropTarget'
    | 'dragPreview'
    | 'draggable'
    | 'onSelectColumn'
    | 'onRemoveColumn'
    | 'onPopulateColumn'
    | 'onAddColRight'
    | 'onAddColLeft'
  > &
    Pick<
      ComponentProps<typeof TableColumnMenu>,
      'onChangeColumnType' | 'parseUnit' | 'isFirst' | 'dropdownNames'
    > & {
      readonly as?: ElementType;
      readonly empty?: boolean;
      readonly focused?: boolean;
      readonly readOnly?: boolean;
      readonly isForImportedColumn?: boolean;
      readonly attributes?: ElementAttributes;
      readonly error?: string;
      readonly isLiveResult?: boolean;
    }
>;

type OptionalSetWidthTableColumnHeaderProps = Omit<
  TableColumnHeaderProps,
  'setWidth'
> & {
  setWidth?: TableColumnHeaderProps['setWidth'];
};

export const TableColumnHeader: FC<OptionalSetWidthTableColumnHeaderProps> = ({
  onChangeColumnType,
  onRemoveColumn,
  onPopulateColumn,
  onAddColLeft,
  onAddColRight,
  parseUnit,
  setWidth = noop,
  width,
  isFirst,
  type = getStringType(),
  readOnly = false,
  isForImportedColumn = false,
  children,
  dropdownNames = [],
  isLiveResult = false,
  error,
  ...props
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <TableHeader
      {...props}
      onRemoveColumn={onRemoveColumn}
      onPopulateColumn={onPopulateColumn}
      onAddColLeft={onAddColLeft}
      onAddColRight={onAddColRight}
      isEditable={!readOnly}
      setWidth={setWidth}
      width={width}
      readOnly={readOnly}
      isFirst={isFirst}
      isLiveResult={isLiveResult}
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
