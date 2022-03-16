import { useIsBlockActive } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar } from '../../primitives';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.heading2.typography, {
  padding: `${blockAlignment.heading2.paddingTop} 0 16px 0`,
});

const verticalClipInset = `calc(${blockAlignment.heading2.paddingTop} * 0.75)`;
const activeStyles = css({
  backgroundColor: cssVar('highlightColor'),
  boxShadow: `0px 0px 0px 100vmin ${cssVar('highlightColor')}`,
  clipPath: `inset(${verticalClipInset} -8px ${verticalClipInset} -8px round 8px)`,
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
