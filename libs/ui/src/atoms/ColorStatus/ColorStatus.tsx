/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { noop } from '@decipad/utils';
import { normalOpacity, transparency } from '../../primitives';
import { statusColors } from '../../utils';
import { ColorStatusCircle } from './ColorStatusCircle';
import { ColorStatusProps } from './ColorStatusProps';

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
