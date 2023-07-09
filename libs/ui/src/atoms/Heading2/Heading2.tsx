/* eslint decipad/css-prop-named-variable: 0 */
import { useIsBlockActive } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar } from '../../primitives';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.heading2.typography, {
  wordBreak: 'break-word',
});

const activeStyles = css({
  backgroundColor: cssVar('highlightColor'),
  boxShadow: `0px 0px 0px 100vmin ${cssVar('highlightColor')}`,
  clipPath: `inset(0 -8px 0 -8px round 8px)`,
});

interface Heading2Props {
  readonly children: ReactNode;
  readonly Heading: 'h3';
  readonly id: string;
}

export const Heading2 = ({
  children,
  Heading,
  id,
}: Heading2Props): ReturnType<React.FC> => {
  const isBlockActive = useIsBlockActive();
  // h{id} is because of css query selectors, dont remove the h
  return (
    <Heading id={`h${id}`} css={[styles, isBlockActive && activeStyles]}>
      {children}
    </Heading>
  );
};
