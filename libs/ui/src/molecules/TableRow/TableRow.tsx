import { ElementAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { DropLineDirection } from '@udecode/plate';
import { FC, forwardRef, ReactNode, RefCallback, RefObject } from 'react';
import { noop } from 'rxjs';
import { useMergedRef } from '../../hooks';
import { draggingOpacity } from '../../organisms/DraggableBlock/DraggableBlock';
import { regularBorder } from '../../organisms/Table/Table';
import {
  TableCellControls,
  TableCellControlsProps,
} from '../TableCellControls/TableCellControls';

const tableRowStyles = (isBeingDragged: boolean) =>
  css({
    opacity: isBeingDragged ? draggingOpacity : 'unset',
    '&:not(:last-child) > td': {
      borderBottom: regularBorder,
    },
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
  readonly previewMode?: boolean;
  readonly tableCellControls?: false | ReactNode;

  /**
   * Table cell controls ref
   */
  readonly dragRef?: RefCallback<HTMLDivElement>;
  readonly previewRef?: RefObject<HTMLDivElement>;
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
      previewMode,
      previewRef,
      isBeingDragged = false,
      isVisible = true,
      tableCellControls,
    },
    ref
  ): ReturnType<FC> => {
    const trRef = useMergedRef(attributes?.ref, ref, previewRef);

    return (
      <tr
        {...attributes}
        ref={trRef}
        css={[
          tableRowStyles(isBeingDragged),
          !isVisible && invisibleTableRowStyles,
        ]}
      >
        {!previewMode &&
          tableCellControls !== false &&
          !readOnly &&
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
