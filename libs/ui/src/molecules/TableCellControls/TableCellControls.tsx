import { forwardRef } from 'react';
import { DragHandle } from '../../icons/index';
import {
  mouseMovingOverTransitionDelay,
  shortAnimationDuration,
} from '../../primitives/index';
import { tableControlWidth } from '../../styles/table';

export interface TableCellControlsProps {
  readonly onSelect?: () => void;
  readonly readOnly?: boolean;
}

export const TableCellControls = forwardRef<
  HTMLTableHeaderCellElement,
  TableCellControlsProps
>(({ readOnly, onSelect }, ref) => {
  return (
    <th
      contentEditable={false}
      ref={ref}
      css={{
        position: 'sticky',
        left: `-${tableControlWidth}`,
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
        '*:hover > &': {
          opacity: 'unset',
        },
        transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,
      }}
    >
      {!readOnly && (
        <button
          css={{ gridArea: 'handle', width: 16, cursor: 'grab' }}
          onClick={onSelect}
        >
          <DragHandle />
        </button>
      )}
    </th>
  );
});
