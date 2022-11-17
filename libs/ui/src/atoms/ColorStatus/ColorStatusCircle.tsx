import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar } from '../../primitives';
import { ColorStatusProps, statusColors } from './ColorStatus';

export const ColorStatusCircle = ({
  name = 'No Status',
  variantStyles = false,
}: ColorStatusProps): ReturnType<FC> => {
  const strokeColor = variantStyles
    ? cssVar('backgroundColor')
    : statusColors[name].rgb;
  const strokeWidth = variantStyles ? '2px' : '1.1px';
  return (
    <span
      css={css({
        height: '12px',
        width: '12px',
        borderRadius: 999999,
        backgroundColor: statusColors[name].rgb,
        border: `${strokeWidth} solid ${strokeColor}`,
        '> svg > path': {
          stroke: `${strokeColor}`,
        },
        '> svg': {
          height: '100%',
          width: '100%',
        },
      })}
    ></span>
  );
};
