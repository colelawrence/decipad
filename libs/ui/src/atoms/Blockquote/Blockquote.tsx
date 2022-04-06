import { useIsBlockActive } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar, grey100, setCssVar } from '../../primitives';
import { blockAlignment } from '../../styles';

const verticalPadding = '6px';
const verticalMargin = `calc(${blockAlignment.blockquote.paddingTop} - ${verticalPadding})`;

const styles = css(
  blockAlignment.blockquote.typography,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    margin: `${verticalMargin} auto`,
    padding: `${verticalPadding} 30px ${verticalPadding} 12px`,
    borderLeft: `4px solid ${grey100.rgb}`,
    wordBreak: 'break-word',
  }
);

const activeStyles = css({
  backgroundColor: cssVar('highlightColor'),
  boxShadow: `0px 0px 0px 100vmin ${cssVar('highlightColor')}`,
  clipPath: `inset(0 -8px 0 -8px round 8px)`,
});

interface BlockquoteProps {
  readonly children: ReactNode;
}

export const Blockquote = ({
  children,
}: BlockquoteProps): ReturnType<React.FC> => {
  const isBlockActive = useIsBlockActive();
  return (
    <blockquote css={[styles, isBlockActive && activeStyles]}>
      {children}
    </blockquote>
  );
};
