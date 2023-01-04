import { css } from '@emotion/react';
import { noop } from 'lodash';
import { FC } from 'react';
import { normalOpacity, transparency } from '../../primitives';
import { statusColors, TColorStatus } from '../../utils';
import { ColorStatusCircle } from './ColorStatusCircle';

export type ColorStatusProps = {
  readonly name: TColorStatus;
  readonly selected?: boolean;
  readonly variantStyles?: boolean;
  readonly onChangeStatus?: (status: TColorStatus) => void;
  readonly toggleActionsOpen?: () => void;
};

export const ColorStatus = ({
  name = 'draft',
  selected = false,
  onChangeStatus = noop,
  toggleActionsOpen = noop,
}: ColorStatusProps): ReturnType<FC> => {
  return (
    <button
      css={[
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
