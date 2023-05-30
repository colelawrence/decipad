/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';

interface SmartRowProps {
  readonly smartCells: ReactNode[];
}

export const SmartRow: FC<SmartRowProps> = ({ smartCells }) => {
  return (
    <>
      {smartCells
        .filter((_, i) => i !== 0)
        .map((smartCell, index) => (
          <th
            css={css({
              verticalAlign: 'middle',
            })}
            key={index}
          >
            {smartCell}
          </th>
        ))}
      <th css={css({ display: 'none' })}></th>
    </>
  );
};
