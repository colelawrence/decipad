import { FC } from 'react';
import { ArrowDiagonalTopRight } from '../../icons';

export const ExternalHrefIcon = (): ReturnType<FC> => {
  return (
    <span
      css={{
        float: 'right',
        paddingLeft: 4,
        height: 12,
        width: 12,
        transform: 'translateY(4px)',
      }}
    >
      <ArrowDiagonalTopRight />
    </span>
  );
};
