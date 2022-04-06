import { useIsBlockActive } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar } from '../../primitives';
import { blockAlignment } from '../../styles';

const { paddingTop } = blockAlignment.heading2;
const paddingBottom = '16px';
const styles = css(blockAlignment.heading2.typography, {
  padding: `${paddingTop} 0 ${paddingBottom}`,
  wordBreak: 'break-word',
});

const topClipInset = `calc(${paddingTop} - ${paddingBottom})`;
const activeStyles = css({
  backgroundColor: cssVar('highlightColor'),
  boxShadow: `0px 0px 0px 100vmin ${cssVar('highlightColor')}`,
  clipPath: `inset(${topClipInset} -8px 0 -8px round 8px)`,
});

interface Heading2Props {
  readonly children: ReactNode;
  readonly Heading: 'h3';
}

export const Heading2 = ({
  children,
  Heading,
}: Heading2Props): ReturnType<React.FC> => {
  const isBlockActive = useIsBlockActive();
  return (
    <Heading css={[styles, isBlockActive && activeStyles]}>{children}</Heading>
  );
};
