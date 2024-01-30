/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, useEffect, useState } from 'react';
import { Placeholder } from '../../../shared';

const paragraphWrapperStyles = css({
  display: 'grid',
  gap: '12px',
  gridAutoRows: '28px',
});

export const TextPlaceholder = (): ReturnType<FC> => {
  const [sizes, setSizes] = useState<number[]>([]);

  useEffect(() => {
    const randomWidth = () => Math.random() * (100 - 85) + 85;
    setSizes(Array.from({ length: 6 }, () => randomWidth()));
  }, []);

  return (
    <div css={paragraphWrapperStyles}>
      {sizes.map((size, i) => (
        <div
          key={`${size}-${i}`}
          css={{ display: 'grid', maxWidth: `${size}%` }}
        >
          <Placeholder />
        </div>
      ))}
    </div>
  );
};
