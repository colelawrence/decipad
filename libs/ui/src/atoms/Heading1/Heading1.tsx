import { useIsBlockActive } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar } from '../../primitives';
import { blockAlignment } from '../../styles';

const { paddingTop } = blockAlignment.heading1;
const paddingBottom = '16px';
const styles = css(blockAlignment.heading1.typography, {
  padding: `${paddingTop} 0 ${paddingBottom}`,
  wordBreak: 'break-word',
});

const topClipInset = `calc(${paddingTop} - ${paddingBottom})`;
const activeStyles = css({
  backgroundColor: cssVar('highlightColor'),
  boxShadow: `0px 0px 0px 100vmin ${cssVar('highlightColor')}`,
  clipPath: `inset(${topClipInset} -8px 0 -8px round 8px)`,
});

interface Heading1Props {
  readonly children: ReactNode;
  readonly Heading: 'h2';
}

export const Heading1 = ({
  children,
  Heading,
}: Heading1Props): ReturnType<React.FC> => {
  const isBlockActive = useIsBlockActive();
  return (
    <Heading css={[styles, isBlockActive && activeStyles]}>{children}</Heading>
  );
};
