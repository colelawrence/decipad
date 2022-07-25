import { FC, ReactNode, useContext } from 'react';
import { css } from '@emotion/react';
import type { SerializedType } from '@decipad/computer';
import { PlateComponentAttributes } from '@decipad/editor-types';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { normalOpacity, p13Medium, transparency } from '../../primitives';
import {
  AvailableSwatchColor,
  baseSwatches,
  getTypeIcon,
  TableStyleContext,
} from '../../utils';
import { DropLine } from '../DropLine/DropLine';
import { Select } from '../Select/Select';

const columnStyles = css(p13Medium, {
  alignItems: 'center',
  verticalAlign: 'middle',
  cursor: 'pointer',
  position: 'relative',
});

const headerWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  minHeight: '30px',
  gap: '6px',
  position: 'relative',
  padding: '0 12px',
});

const columnTypeStyles = css({
  display: 'inline-block',
  width: '12px',
  height: '12px',
});

const childrenWrapperStyles = css({
  whiteSpace: 'nowrap',
  textAlign: 'left',
});

const dropStyles = css({
  position: 'absolute',
  top: 0,
});

const leftDropStyles = css({
  left: '-2px',
});

const rightDropStyles = css({
  right: '1px',
});

export interface PowerTableColumnHeaderProps<TAggregation extends string> {
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
}

export function PowerTableColumnHeader<TAggregation extends string>({
  name,
  type,
  attributes,
  children,
  availableAggregations,
  selectedAggregation,
  onAggregationChange,
  connectDragSource,
  connectDropTarget,
  overDirection,
}: PowerTableColumnHeaderProps<TAggregation>): ReturnType<FC> {
  const { color } = useContext(TableStyleContext);
  const Icon = getTypeIcon(type);

  return (
    <th
      {...attributes}
      css={[
        columnStyles,
        css({
          backgroundColor:
            color &&
            transparency(
              baseSwatches[color as AvailableSwatchColor],
              normalOpacity
            ).rgba,
          // Keep hover effect when hovered, focused or the dropdown menu is opened.
          '&:hover, &:focus-within, &[data-highlight="true"]': {
            backgroundColor:
              color && baseSwatches[color as AvailableSwatchColor].rgb,
          },

          boxShadow:
            color &&
            `inset 0px -2px 0px ${
              baseSwatches[color as AvailableSwatchColor].rgb
            }`,
        }),
      ]}
    >
      {overDirection === 'left' && (
        <div css={[dropStyles, leftDropStyles]} contentEditable={false}>
          <DropLine variant="inline" />
        </div>
      )}
      <div ref={connectDropTarget} contentEditable={false}>
        <div css={headerWrapperStyles} ref={connectDragSource}>
          {name}

          <div>
            <Select
              options={availableAggregations}
              value={selectedAggregation}
              onChange={onAggregationChange}
            ></Select>
          </div>
          <span css={columnTypeStyles}>
            <Icon />
          </span>
          <div css={childrenWrapperStyles}>{children}</div>
        </div>
      </div>
      {overDirection === 'right' && (
        <div css={[dropStyles, rightDropStyles]} contentEditable={false}>
          <DropLine variant="inline" />
        </div>
      )}
    </th>
  );
}
