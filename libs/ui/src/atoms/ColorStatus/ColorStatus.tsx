import { css } from '@emotion/react';
import { noop } from 'lodash';
import { FC } from 'react';
import { normalOpacity, transparency } from '../../primitives';
import { baseSwatches } from '../../utils';
import { ColorStatusCircle } from './ColorStatusCircle';

export type TColorStatus =
  | 'No Status'
  | 'To Do'
  | 'In Progress'
  | 'Review'
  | 'Done';

export const statusColors = {
  'No Status': baseSwatches.Catskill,
  'To Do': baseSwatches.Malibu,
  'In Progress': baseSwatches.Perfume,
  Review: baseSwatches.Grapefruit,
  Done: baseSwatches.Sulu,
};

export const AvailableColorStatus: TColorStatus[] = Object.keys(
  statusColors
) as TColorStatus[];

export type ColorStatusProps = {
  readonly name: TColorStatus;
  readonly selected?: boolean;
  readonly variantStyles?: boolean;
  readonly onChangeStatus?: (status: TColorStatus) => void;
  readonly toggleActionsOpen?: () => void;
};

export const ColorStatus = ({
  name = 'No Status',
  selected = false,
  onChangeStatus = noop,
  toggleActionsOpen = noop,
}: ColorStatusProps): ReturnType<FC> => {
  return (
    <button
      css={[
        { display: 'flex', alignItems: 'center', gap: '5px' },
        selected &&
          css({
            backgroundColor: transparency(statusColors[name], normalOpacity)
              .rgba,
            borderRadius: '8px',
          }),
      ]}
      onClick={() => {
        onChangeStatus(name);
        toggleActionsOpen();
      }}
    >
      <ColorStatusCircle name={name} />
      <span>{name}</span>
    </button>
  );
};
