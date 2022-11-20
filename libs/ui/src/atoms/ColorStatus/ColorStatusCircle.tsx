import { css } from '@emotion/react';
import { FC } from 'react';
import { ColorStatusProps, statusColors } from './ColorStatus';

export const ColorStatusCircle = ({
  name = 'No Status',
}: ColorStatusProps): ReturnType<FC> => {
  return (
    <span
      css={css({
        height: '12px',
        width: '12px',
        borderRadius: 999999,
        backgroundColor: statusColors[name].rgb,
        border: `1.1px solid ${statusColors[name].rgb}`,
        '> svg > path': {
          stroke: `${statusColors[name].rgb}`,
        },
        '> svg': {
          height: '100%',
          width: '100%',
        },
      })}
    ></span>
  );
};
