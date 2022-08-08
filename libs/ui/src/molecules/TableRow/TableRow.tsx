import { ElementAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { DropLineDirection } from '@udecode/plate';
import { ReactNode, RefCallback, forwardRef, FC } from 'react';
import { noop } from 'rxjs';
import { TableData } from '../../atoms';
import { useMergedRef } from '../../hooks';
import { Minus } from '../../icons';
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

const tableRowStyles = (isBeingDragged: boolean) =>
  css({
    opacity: isBeingDragged ? draggingOpacity : 'unset',
  });

const invisibleTableRowStyles = css({
  display: 'none',
});

interface TableRowProps extends TableCellControlsProps {
  readonly attributes?: ElementAttributes;
  readonly children: ReactNode;
  readonly onRemove?: () => void;
  readonly readOnly?: boolean;
  readonly draggable?: boolean;
  readonly isBeingDragged?: boolean;
  readonly dropLine?: DropLineDirection;
  readonly isVisible?: boolean;

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
      isBeingDragged = false,
      isVisible = true,
    },
    ref
  ): ReturnType<FC> => {
    const trRef = useMergedRef(attributes?.ref, ref);

    return (
      <tr
        {...attributes}
        ref={trRef}
        css={[
          tableRowStyles(isBeingDragged),
          !isVisible && invisibleTableRowStyles,
        ]}
      >
        {!readOnly && (
          <TableCellControls
            ref={dragRef}
            readOnly={readOnly}
            onSelect={onSelect}
          />
        )}
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
