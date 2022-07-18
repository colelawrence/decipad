import { forwardRef } from 'react';
import { DragHandle } from '../../icons/index';
import {
  mouseMovingOverTransitionDelay,
  shortAnimationDuration,
} from '../../primitives/index';

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
        opacity: 0,
        '*:hover > &': {
          opacity: 'unset',
        },
        transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,
        verticalAlign: 'middle',
        marginRight: '6px',
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
