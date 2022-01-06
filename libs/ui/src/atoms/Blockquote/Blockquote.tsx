import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar, p16Regular, purple300, setCssVar } from '../../primitives';

const styles = css(
  p16Regular,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    padding: '6px 0 6px 12px',
    borderLeft: `6px solid ${purple300.rgb}`,
  }
);

interface BlockquoteProps {
  readonly children: ReactNode;
}

export const Blockquote = ({
  children,
}: BlockquoteProps): ReturnType<React.FC> => {
  return <blockquote css={styles}>{children}</blockquote>;
};
