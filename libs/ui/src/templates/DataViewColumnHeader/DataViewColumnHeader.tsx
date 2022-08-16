import { FC, ReactNode } from 'react';
import type { SerializedType } from '@decipad/computer';
import { PlateComponentAttributes } from '@decipad/editor-types';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { css } from '@emotion/react';
import { DropLine } from '../../atoms';
import { Select } from '../../organisms';

export interface DataViewColumnHeaderProps<TAggregation extends string> {
  name: string;
  type: SerializedType;
  attributes?: PlateComponentAttributes;
  children?: ReactNode;
  selectedAggregation?: TAggregation;
  availableAggregations: Array<TAggregation>;
  onAggregationChange: (aggregation: TAggregation | undefined) => void;
  connectDragSource?: ConnectDragSource;
  connectDragPreview?: ConnectDragPreview;
  connectDropTarget?: ConnectDropTarget;
  overDirection?: 'left' | 'right';
  alignRight?: boolean;
}

const dataViewColumnHeaderStyles = css({
  whiteSpace: 'nowrap',
});

const dataViewColumnHeaderSelectWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const alignRightStyles = css({
  justifyContent: 'flex-end',
});

export function DataViewColumnHeader<TAggregation extends string>({
  name,
  attributes,
  children,
  availableAggregations,
  selectedAggregation,
  onAggregationChange,
  connectDragSource,
  connectDropTarget,
  overDirection,
  alignRight = false,
}: DataViewColumnHeaderProps<TAggregation>): ReturnType<FC> {
  return (
    <th {...attributes} css={dataViewColumnHeaderStyles}>
      {overDirection === 'left' && (
        <div contentEditable={false}>
          <DropLine variant="inline" />
        </div>
      )}
      <div ref={connectDropTarget} contentEditable={false}>
        <div
          ref={connectDragSource}
          // eslint-disable-next-line no-sparse-arrays
          css={[
            dataViewColumnHeaderSelectWrapperStyles,
            alignRight ? alignRightStyles : null,
          ]}
        >
          {name}

          <Select
            options={availableAggregations}
            value={selectedAggregation}
            onChange={onAggregationChange}
          ></Select>

          <div>{children}</div>
        </div>
      </div>
      {overDirection === 'right' && (
        <div contentEditable={false}>
          <DropLine variant="inline" />
        </div>
      )}
    </th>
  );
}
