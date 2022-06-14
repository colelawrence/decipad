import { Children, FC, forwardRef, ReactNode, RefCallback } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { ElementAttributes } from '@decipad/editor-types';
import { DropLineDirection } from '@udecode/plate';
import { TableData } from '../../atoms';
import { Minus } from '../../icons';
import { table } from '../../styles';
import { useMergedRef } from '../../hooks/index';
import { draggingOpacity } from '../../organisms/DraggableBlock/DraggableBlock';
import {
  TableCellControls,
  TableCellControlsProps,
} from '../TableCellControls/TableCellControls';

const buttonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  paddingLeft: '12px',
  paddingRight: '12px',
});

const iconWrapperStyles = css({
  height: '20px',
  width: '20px',
});

interface TableRowProps extends TableCellControlsProps {
  readonly attributes?: ElementAttributes;
  readonly children: ReactNode;
  readonly onRemove?: () => void;
  readonly readOnly?: boolean;

  readonly isBeingDragged?: boolean;
  readonly dropLine?: DropLineDirection;

  /**
   * Table cell controls ref
   */
  readonly dragRef?: RefCallback<HTMLDivElement>;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    {
      attributes,
      children,
      onRemove = noop,
      onSelect,
      readOnly = false,
      dragRef,
      isBeingDragged,
    },
    ref
  ): ReturnType<FC> => {
    const trRef = useMergedRef(attributes?.ref, ref);

    return (
      <tr
        {...attributes}
        ref={trRef}
        css={css({
          position: 'relative',
          display: 'grid',
          gridTemplate: table.rowTemplate(
            Children.toArray(children).length,
            !!readOnly
          ),
          opacity: isBeingDragged ? draggingOpacity : 'unset',
        })}
      >
        <TableCellControls
          ref={dragRef}
          readOnly={readOnly}
          onSelect={onSelect}
        />
        {children}
        {!readOnly && (
          <TableData contentEditable={false} as="td">
            <button css={buttonStyles} onClick={onRemove}>
              <span css={iconWrapperStyles}>
                <Minus />
              </span>
            </button>
          </TableData>
        )}
      </tr>
    );
  }
);
