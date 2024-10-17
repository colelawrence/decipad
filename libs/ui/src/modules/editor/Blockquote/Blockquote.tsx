/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar } from '../../../primitives';
import { blockAlignment } from '../../../styles';

const verticalPadding = '6px';

const styles = css(
  blockAlignment.blockquote.typography,

  {
    padding: `${verticalPadding} 30px ${verticalPadding} 12px`,
    borderLeft: `4px solid ${cssVar('backgroundDefault')}`,
    wordBreak: 'break-word',
  }
);

export interface BlockquoteProps {
  readonly children: ReactNode;
}

export const Blockquote = ({
  children,
}: BlockquoteProps): ReturnType<React.FC> => {
  return (
    <blockquote aria-roledescription="column-content" css={styles}>
      {children}
    </blockquote>
  );
};
