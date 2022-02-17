import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar, purple300, setCssVar } from '../../primitives';
import { blockAlignment } from '../../styles';

const styles = css(
  blockAlignment.blockquote.typography,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    margin: `calc(${blockAlignment.blockquote.paddingTop} - 6px) 0`,
    padding: `6px 0 6px 12px`,
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
