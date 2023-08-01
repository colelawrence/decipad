/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ReactNode, useState } from 'react';
import { cssVar } from '../../primitives';

const spoilerStyles = css({
  backgroundColor: cssVar('textHeavy'),
  color: 'transparent',
  // why you ask? because kelly put an emoji and i wanted to hide an emoji
  textShadow: `0 0 0 ${cssVar('textHeavy')}`,
  borderRadius: '2px',
  cursor: 'pointer',
});

const milkIsSpoiledStyles = css({
  backgroundColor: cssVar('backgroundHeavy'),
  color: cssVar('textDefault'),
  cursor: 'text',
});

interface SpoilerProps {
  readonly children: ReactNode;
}
export const Spoiler = ({ children }: SpoilerProps): ReturnType<React.FC> => {
  const [spoiled, isSpoiled] = useState(false);
  return (
    <span
      css={[spoilerStyles, spoiled && milkIsSpoiledStyles]}
      onClick={() => {
        // on click spoil
        if (!spoiled) {
          isSpoiled(true);
        }
      }}
    >
      {children}
    </span>
  );
};
