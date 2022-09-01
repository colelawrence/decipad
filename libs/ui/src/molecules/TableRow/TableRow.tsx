import { ElementAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { DropLineDirection } from '@udecode/plate';
import { ReactNode, RefCallback, forwardRef, FC } from 'react';
import { noop } from 'rxjs';
import { useMergedRef } from '../../hooks';
import { draggingOpacity } from '../../organisms/DraggableBlock/DraggableBlock';
import {
  TableCellControls,
  TableCellControlsProps,
} from '../TableCellControls/TableCellControls';

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
  readonly tableCellControls?: false | ReactNode;

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
      tableCellControls,
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
        {tableCellControls !== false &&
          (tableCellControls || (
            <TableCellControls
              ref={dragRef}
              readOnly={readOnly}
              onSelect={onSelect}
              onRemove={onRemove}
            />
          ))}
        {children}
      </tr>
    );
  }
);
